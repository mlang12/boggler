window.onload = function () {
  var animationTimer;

  var resetBoard = () => {
    clearInterval(animationTimer);
    clearTileColors();
    clearOutput();
    return fillBoard(Array(16).fill(""));
  };

  var fillBoard = (vals) => {
    if (Array.isArray(vals) === false || vals.length !== 16) {
      populateError('There was an error populating the board.');
      return;
    }
    for (var x = 1; x < 17; x++) {
      var el = document.getElementById(`letter-${x}`);
      if (el) {
        el.value = vals[x - 1];
      }
    }
  };

  var handleGenerate = (result) => {
    resetBoard();
    return fillBoard(result.letters);
  };

  var handleBoggleSolve = (result) => {
    var { words, board, input, solveTime } = result.solved;
    var output = words.map(w => `${w.word} (${w.score})`).join(', ');
    output = `
      <h3>Total board results</h3>
      <h4>Board score: ${board.totalBoardScore}</h4>
      <h4>Words found: ${words.length}</h4>
      <h4>Solve method: ${input.type}</h4>
      <h4>Solve time: ${solveTime}ms</h4>
      ${output}
    `;
    populateOutput(output);

    // Animate the paths taken by the solver algo
    const animateToggle = document.getElementById('show-animation');
    if (board.pathTracker.length && animateToggle && animateToggle.checked) {
      var replay = [...board.pathTracker];
      var lightUpPath = () => {
        var pth = replay.pop();
        if (pth == null) {
          clearTileColors();
          return clearInterval(animationTimer);
        }
        var foundClass = pth.foundWord ? 'boggle-tile-path-found' : 'boggle-tile-path'
        applyClassToLetters(pth.visited, foundClass);
        var clearItems = (replay.length)
          ? [...replay[replay.length - 1].visited]
          : [];
        pth.visited = pth.visited.filter(i => !clearItems.includes(i));
        setTimeout(() => applyClassToLetters(pth.visited, 'boggle-tile'), 300);
      }
      animationTimer = setInterval(lightUpPath, 400);
    }
  };

  var applyClassToLetters = (paths, cls) => {
    for (var i of paths) {
      try {
        document.getElementById(`letter-${i}`).className = cls;
      } catch (err) {
        console.log(`Tried to get element for ${i} failed.`);  
      }
    }
  };

  var clearTileColors = () => {
    applyClassToLetters([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], 'boggle-tile');
  };

  var populateError = (errMsg) => {
    document.getElementById('output-area').className = 'onShow errMsg';
    document.getElementById('output-area').innerHTML = `<p>${errMsg}</p>`;
  };

  var populateOutput = (msg) => {
    document.getElementById('output-area').className = 'onShow';
    document.getElementById('output-area').innerHTML = `<p>${msg}</p>`;
  };

  var clearOutput = () => {
    document.getElementById('output-area').className = 'onHide';
    document.getElementById('output-area').innerHTML = '';
  };

  var isLetter = (str) => {
    return (/[a-zA-Z]/.test(str));
  }

  var shouldTab = (e) => {
    if (!(e.keyCode >= 65 && e.keyCode <= 90)) {
      return false;
    }
    var val = e.target.value;
    if (!(e.key && e.key.toLocaleLowerCase() === val.toLocaleLowerCase())) {
      return false;
    }
    if (val.length !== 1 || !isLetter(val)) {
      return false;
    }
    // Last boggle spot will not trigger tab.
    if (e.target.id && e.target.id.endsWith("16")) {
      return false;
    }
    return true;
  }

  var tab = (e) => {
    e.preventDefault();
    var val = e.target.value;
    if (shouldTab(e)) {
      e.target.className = 'boggle-tile';
      e.target.nextSibling.focus(); 
      return;
    }
    if (val.length && !isLetter(val)){
      e.target.className = 'boggle-tile-error';
    }
  }

  var loadXMLDoc = (args) => {
    var xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState == XMLHttpRequest.DONE) {   // XMLHttpRequest.DONE == 4
        if (xmlhttp.status == 200) {
          var result = JSON.parse(xmlhttp.response);
          if (result.error) {
            return populateError(result.error);
          }

          if (result.solved && result.solved.words) {
            return handleBoggleSolve(result);
          }

          if (result.letters) {
            return handleGenerate(result);
          }
        }
        else if (xmlhttp.status == 400) {
          console.log('There was an error 400');
          return populateError('There was an error 400');
        }
        else {
          console.log('Something else other than 200 was returned');
          return populateError('Something else other than 200 was returned');
        }
      }
    };

    var { type, word, minVal, boardType, includePaths } = args;

    if (type === 'boggler-trie') {
      xmlhttp.open('GET', `api/boggler/${word}/${minVal}/trie/${includePaths || 0}`, true);
    }
    if (type === 'boggler-std') {
      xmlhttp.open('GET', `api/boggler/${word}/${minVal}/std/${includePaths || 0}`, true);
    }
    if (type === 'generate') {
      xmlhttp.open('GET', `api/boggle-generate/${boardType}`, true);
    }
    xmlhttp.send();
  };

  var sendSolveRequest = (e, type) => {
    var letters = [];
    const animateToggle = document.getElementById('show-animation');
    clearInterval(animationTimer);
    clearTileColors();
    e.preventDefault();
    for (var x = 1; x < 17; x++) {
      var letter = document.getElementById(`letter-${x}`).value;
      if (!isLetter(letter)) {
        break;
      }
      letters.push(letter.toLocaleLowerCase());
    }
    return (letters.length === 16)
      ? loadXMLDoc({
        type: `boggler-${type}`,
        word: letters.join(''),
        minVal: 3,
        includePaths: (animateToggle && animateToggle.checked) ? 1 : 0
      })
      : populateError('Please provide 16 letters, or click "Generate".');
  };

  if (document.getElementById('solve-boggle-std')) {
    document.getElementById('solve-boggle-std').addEventListener('click', (e) => sendSolveRequest(e, 'std'));
  }

  if (document.getElementById('solve-boggle-trie')) {
    document.getElementById('solve-boggle-trie').addEventListener('click', (e) => sendSolveRequest(e, 'trie'));
  }

  if (document.getElementById('generate-boggle')) {
    document.getElementById('generate-boggle').addEventListener('click', () => {
      var diceType = document.getElementById('use-old-dice');
      return loadXMLDoc({
        type: 'generate',
        boardType: diceType.checked ? 'OLD' : 'NEW'
      });
    });
  }

  if (document.getElementById('clear-boggle')) {
    document.getElementById('clear-boggle').addEventListener('click', resetBoard);
  }

  for (var x = 1; x < 17; x++) {
    document.getElementById(`letter-${x}`).addEventListener('keyup', tab);
  }

  document.getElementById('fter').innerHTML = `<a href='https://mindbrier.com' target='_blank' class='footer-area-links'>Mindbrier</a> ${new Date().getFullYear().toString()} <span>&#169;</span>`;
};