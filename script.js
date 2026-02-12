function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatTextWithAppends(text, prefix, appendColor = '&7') {
  const maxBlockLength = 210;

  let quoteCount = 0;
  text = text.replace(/"/g, () => (quoteCount++ % 2 === 0 ? '“' : '”'));

  const quoteStyleMap = { simple: '&f', colored: '&7', bold: '&f&l' };
  const quoteOpenChar = '“';
  const quoteCloseChar = '”';

  let globalQuoteStyle = quoteStyleMap.simple;
  if (prefix.endsWith('c')) globalQuoteStyle = quoteStyleMap.colored;
  if (prefix.endsWith('l')) globalQuoteStyle = quoteStyleMap.bold;

  const words = text.split(/(\s+)/);
  const blocks = [];
  let currentBlock = '';

  const estimateLength = (block, suffix) => {
    let len = block.replace(/&[0-9a-fk-or]/gi, '').length;
    len += prefix.length + 1;
    len += suffix.length;
    return len;
  };

  for (const word of words) {
    let suffix = '--';
    if ((blocks.length % 4) === 2) suffix = ` ${appendColor}[+]`;

    if (estimateLength(currentBlock + word, suffix) > maxBlockLength) {
      if (currentBlock) blocks.push(currentBlock.trim());
      currentBlock = word;
    } else currentBlock += word;
  }
  if (currentBlock) blocks.push(currentBlock.trim());

  const result = [];
  let quoteOpenGlobally = false;
  let realBlockIndex = 0;

  for (let i = 0; i < blocks.length; i++) {
    const isLastBlock = i === blocks.length - 1;
    const cycleIndex = realBlockIndex % 4;
    let currentPrefix = realBlockIndex === 0 ? prefix : '';
    let suffix = '';
    if (!isLastBlock) {
      switch (cycleIndex) {
        case 0:
        case 1:
        case 3: suffix = '--'; break;
        case 2: suffix = ` ${appendColor}[+]`; break;
      }
    }
    if (cycleIndex === 3) {
      if (prefix.endsWith('c')) currentPrefix = '/itc';
      else if (prefix.endsWith('l')) currentPrefix = '/itl';
      else currentPrefix = '/it';
    }
    let prefixStart = currentPrefix ? `${currentPrefix} ` : '';

    let block = blocks[i];
    let quoteState = quoteOpenGlobally;
    let processed = '';
    let parts = block.split(/(“|”)/);
    let lastAppliedCode = '';
    for (let part of parts) {
      if (part === quoteOpenChar) {
        processed += appendColor + quoteOpenChar + globalQuoteStyle;
        quoteState = true; lastAppliedCode = globalQuoteStyle;
      } else if (part === quoteCloseChar) {
        processed += appendColor + quoteCloseChar + '&u';
        quoteState = false; lastAppliedCode = '&u';
      } else {
        const styleCode = quoteState ? globalQuoteStyle : '&u';
        processed += (lastAppliedCode !== styleCode ? styleCode : '') + part;
        lastAppliedCode = styleCode;
      }
    }

    result.push({ raw: `${prefixStart}${processed}${suffix}`, preview: processed, length: block.replace(/&[0-9a-fk-or]/gi, '').length });
    realBlockIndex++;
    quoteOpenGlobally = quoteState;
  }

  return result;
}

function applyColorCodes(text) {
  let output = '';
  let parts = text.split(/(&f&l|&[0-9a-fk-oru])/gi);
  let openSpan = false;

  for (let part of parts) {
    if (part.match(/^&/)) {
      if (openSpan) output += '</span>';
      openSpan = true;
      const cleanCode = part.toLowerCase().replace('&', '');
      switch (cleanCode) {
        case 'f&l':
          output += '<span class="code-fl">';
          break;
        case 'l':
        case 'o':
        case 'n':
        case 'm':
        case 'k':
        case 'u':
          output += `<span class="code-${cleanCode}">`;
          break;
        default:
          if (cleanCode.length === 1 && '0123456789abcdef'.includes(cleanCode)) output += `<span class="code-${cleanCode}">`;
          else output += '<span>';
          break;
      }
    } else output += part;
  }
  if (openSpan) output += '</span>';
  return output.replace(/\n/g, '<br>');
}

function generateOutput() {
  const inputText = document.getElementById("inputText").value;
  const command = document.getElementById("command").value;
  const appendColor = document.getElementById("appendColor").value;
  const outputDiv = document.getElementById("output");
  outputDiv.innerHTML = '';
  const blocks = formatTextWithAppends(inputText, command, appendColor);
  blocks.forEach(({ raw, preview, length }) => {
    const blockEl = document.createElement('div');
    blockEl.className = 'output-block';
    const previewEl = document.createElement('div');
    previewEl.className = 'block-preview';
    previewEl.innerHTML = applyColorCodes(preview);
    const rawEl = document.createElement('pre');
    rawEl.className = 'block-raw';
    rawEl.textContent = raw;
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-button';
    copyBtn.textContent = 'Copy';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(rawEl.textContent);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => (copyBtn.textContent = 'Kopiuj'), 1000);
    };
    const charCount = document.createElement('div');
    charCount.className = 'char-count';
    charCount.textContent = `Characters: ${length}`;
    blockEl.appendChild(previewEl);
    blockEl.appendChild(rawEl);
    blockEl.appendChild(copyBtn);
    blockEl.appendChild(charCount);
    outputDiv.appendChild(blockEl);
  });
}

function openCredits() {
  const overlay = document.getElementById('creditsOverlay');
  if (!overlay) return;
  overlay.hidden = false;
}

function closeCredits() {
  const overlay = document.getElementById('creditsOverlay');
  if (!overlay) return;
  overlay.hidden = true;
}
