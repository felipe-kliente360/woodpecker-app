/* Gera os arquivos de puzzles de puzzles/ a partir do dump completo do
 * Lichess (CC0). Job de dados pontual — rodável local.
 *
 * Pré-requisito: baixar o dump (~270MB) de
 *   https://database.lichess.org/lichess_db_puzzle.csv.zst
 *
 * Uso:
 *   node scripts/gerar-puzzles.js [caminho-do-dump]
 *   (default: /tmp/lichess_db_puzzle.csv.zst)
 *
 * Saída: puzzles/puzzles_<faixa>.json.gz + puzzles/manifest.json
 *
 * Cota: até COTA puzzles por (tema × faixa). É teto, não garantia —
 * temas raros e faixas extremas não atingem a cota e o script preenche
 * com o que existir. Node 22.15+ necessário (zstd no módulo zlib).
 */
'use strict';

const fs       = require('fs');
const path     = require('path');
const zlib     = require('zlib');
const readline = require('readline');

const COTA      = 2000;
const DUMP      = process.argv[2] || '/tmp/lichess_db_puzzle.csv.zst';
// Default escreve em puzzles/. WP_PUZZLES_OUT permite gerar pra um
// diretório de rascunho e conferir antes de substituir os arquivos reais.
const SAIDA_DIR = process.env.WP_PUZZLES_OUT || path.join(__dirname, '..', 'puzzles');

// Faixas de rating. Puzzle r entra na faixa onde min <= r < max.
// Abaixo de 600 ou >= 2800 é descartado (espelha o export atual).
const FAIXAS = [
  ['600_800',   600,  800],
  ['800_1000',  800,  1000],
  ['1000_1200', 1000, 1200],
  ['1200_1400', 1200, 1400],
  ['1400_1600', 1400, 1600],
  ['1600_1800', 1600, 1800],
  ['1800_2000', 1800, 2000],
  ['2000_2800', 2000, 2800],
];

function faixaDe(rating) {
  for (const f of FAIXAS) {
    if (rating >= f[1] && rating < f[2]) return f[0];
  }
  return null;
}

// Greedy: ordena por popularidade desc (qualidade) e adiciona o puzzle
// se qualquer um dos seus temas ainda está abaixo da cota. Garante que
// cada tema atinge min(COTA, disponível).
function selecionar(puzzles) {
  puzzles.sort((a, b) => b.popularidade - a.popularidade);
  const cont = Object.create(null);
  const escolhidos = [];
  for (const p of puzzles) {
    let precisa = false;
    for (const t of p.temas) {
      if ((cont[t] || 0) < COTA) { precisa = true; break; }
    }
    if (!precisa) continue;
    escolhidos.push(p);
    for (const t of p.temas) cont[t] = (cont[t] || 0) + 1;
  }
  return escolhidos;
}

async function main() {
  if (!fs.existsSync(DUMP)) {
    console.error('Dump não encontrado: ' + DUMP);
    console.error('Baixe de https://database.lichess.org/lichess_db_puzzle.csv.zst');
    process.exit(1);
  }

  console.log('Lendo ' + DUMP + ' ...');
  const balde = Object.create(null);          // faixa -> array de puzzles
  for (const f of FAIXAS) balde[f[0]] = [];

  const stream = fs.createReadStream(DUMP).pipe(zlib.createZstdDecompress());
  const rl = readline.createInterface({ input: stream, crlfDelay: Infinity });

  let linhas = 0, aceitos = 0, primeira = true;
  for await (const linha of rl) {
    if (primeira) { primeira = false; continue; }   // header
    if (!linha) continue;
    linhas++;
    // CSV do Lichess: sem campos com vírgula — split direto é seguro.
    // PuzzleId,FEN,Moves,Rating,RatingDeviation,Popularity,NbPlays,Themes,GameUrl,OpeningTags
    const c = linha.split(',');
    if (c.length < 8) continue;
    const rating = parseInt(c[3], 10);
    if (!rating) continue;
    const faixa = faixaDe(rating);
    if (!faixa) continue;
    const temas = c[7] ? c[7].split(' ').filter(Boolean) : [];
    if (temas.length === 0) continue;
    balde[faixa].push({
      id:           c[0],
      fen:          c[1],
      lances:       c[2].split(' ').filter(Boolean),
      rating:       rating,
      desvio:       parseInt(c[4], 10) || 0,
      popularidade: parseInt(c[5], 10) || 0,
      jogadas:      parseInt(c[6], 10) || 0,
      temas:        temas,
      abertura:     (c[9] && c[9].trim()) ? c[9].trim() : null,
    });
    aceitos++;
    if (linhas % 500000 === 0) console.log('  ' + linhas + ' linhas lidas...');
  }
  console.log('Total: ' + linhas + ' linhas, ' + aceitos + ' nas faixas alvo.');

  if (!fs.existsSync(SAIDA_DIR)) fs.mkdirSync(SAIDA_DIR, { recursive: true });

  const manifest = {
    versao:        '1.0',
    gerado_em:     new Date().toISOString().slice(0, 19),
    fonte:         'Lichess Puzzle Database (CC0)',
    total_puzzles: 0,
    faixas:        {},
  };

  for (const [nome] of FAIXAS) {
    const todos = balde[nome];
    const escolhidos = selecionar(todos);
    balde[nome] = null;                              // libera memória

    const arquivo = 'puzzles_' + nome + '.json.gz';
    const gz = zlib.gzipSync(Buffer.from(JSON.stringify(escolhidos)), { level: 9 });
    fs.writeFileSync(path.join(SAIDA_DIR, arquivo), gz);

    const temasSet = new Set();
    let somaR = 0, minR = Infinity, maxR = -Infinity;
    for (const p of escolhidos) {
      somaR += p.rating;
      if (p.rating < minR) minR = p.rating;
      if (p.rating > maxR) maxR = p.rating;
      for (const t of p.temas) temasSet.add(t);
    }
    const n = escolhidos.length;
    manifest.faixas[nome] = {
      arquivo:           arquivo,
      total:             n,
      rating_min:        n ? minR : 0,
      rating_max:        n ? maxR : 0,
      rating_medio:      n ? Math.round(somaR / n) : 0,
      temas_disponiveis: Array.from(temasSet).sort(),
      tamanho_bytes:     gz.length,
    };
    manifest.total_puzzles += n;
    console.log('  ' + nome + ': ' + n + ' puzzles, ' +
      (gz.length / 1024 / 1024).toFixed(1) + ' MB');
  }

  fs.writeFileSync(
    path.join(SAIDA_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 1)
  );
  console.log('Pronto. ' + manifest.total_puzzles + ' puzzles em ' + SAIDA_DIR);
}

main().catch(function (e) { console.error(e); process.exit(1); });
