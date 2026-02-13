function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function formatTextWithAppends(text, prefix, appendColor = '&7') {
  const maxBlockLength = 210;

  let quoteCount = 0;
  text = text.replace(/"/g, () =>
    quoteCount++ % 2 === 0 ? '“' : '”'
  );

  const quoteStyleMap = {
    simple: '&f',
    colored: '&7',
    bold: '&f&l'
  };

  const quoteOpenChar = '“';
  const quoteCloseChar = '”';

  let globalQuoteStyle = quoteStyleMap.simple;
  if (prefix.endsWith('c')) globalQuoteStyle = quoteStyleMap.colored;
  if (prefix.endsWith('l')) globalQuoteStyle = quoteStyleMap.bold;

  const visibleLength = str =>
    str.replace(/&[0-9a-fk-or]/gi, '').length;

  const words = text.split(/(\s+)/);
  const blocks = [];
  let current = '';

  for (const word of words) {
    if (visibleLength(current + word) > maxBlockLength) {
      if (current.trim()) blocks.push(current.trim());
      current = word;
    } else {
      current += word;
    }
  }

  if (current.trim()) blocks.push(current.trim());

  const result = [];
  let quoteOpenGlobally = false;

  let textInGroup = 0;

  for (let i = 0; i < blocks.length; i++) {

    let currentPrefix = '';
    let suffix = '';

    if (i === 0) {
      currentPrefix = prefix;
    }

    else if (textInGroup === 3) {
      if (prefix.endsWith('c')) currentPrefix = '/itc';
      else if (prefix.endsWith('l')) currentPrefix = '/itl';
      else currentPrefix = '/it';

      textInGroup = 0;
    }

const isLastBlock = i === blocks.length - 1;

if (!isLastBlock) {
  if (textInGroup === 2) {
    suffix = ` ${appendColor}[+]`;
  } else {
    suffix = '--';
  }
} else {
  suffix = '';
}


    let block = blocks[i];
    let processed = '';
    let quoteState = quoteOpenGlobally;
    let lastAppliedCode = '';

    const parts = block.split(/(“|”)/);

    for (let part of parts) {
      if (part === quoteOpenChar) {
        processed += appendColor + quoteOpenChar + globalQuoteStyle;
        quoteState = true;
        lastAppliedCode = globalQuoteStyle;
      } 
      else if (part === quoteCloseChar) {
        processed += appendColor + quoteCloseChar + '&u';
        quoteState = false;
        lastAppliedCode = '&u';
      } 
      else {
        const styleCode = quoteState ? globalQuoteStyle : '&u';
        if (lastAppliedCode !== styleCode) {
          processed += styleCode;
          lastAppliedCode = styleCode;
        }
        processed += part;
      }
    }

    result.push({
      raw: (currentPrefix ? currentPrefix + ' ' : '') + processed + suffix,
      preview: processed,
      length: visibleLength(block)
    });

    textInGroup++;
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
          if ('0123456789abcdef'.includes(cleanCode))
            output += `<span class="code-${cleanCode}">`;
          else
            output += '<span>';
      }
    } else {
      output += part;
    }
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


//    |\__/,|   (`\
//  _.|o o  |_   ) )
//-(((---(((--------
// meowzers! nice code! :3


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
      setTimeout(() => (copyBtn.textContent = 'Copy'), 1000);
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
