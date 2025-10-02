
    const terminal = document.getElementById('terminal');
    const PROMPT = 'user@web:~$';
    let history = [];
    let historyIndex = -1;

    function createPromptLine(focus=true){
      const line = document.createElement('div');
      line.className = 'line';
      const p = document.createElement('span');
      p.className = 'prompt';
      p.textContent = PROMPT;
      const input = document.createElement('span');
      input.className = 'input';
      input.contentEditable = 'true';
      input.spellcheck = false;
      input.setAttribute('role','textbox');
      input.setAttribute('aria-label','Terminal input');
      input.addEventListener('keydown', onInputKeyDown);
      input.addEventListener('paste', onPaste);
      line.appendChild(p);
      line.appendChild(input);
      const cursor = document.createElement('span');
      cursor.className = 'cursor';
      line.appendChild(cursor);
      terminal.appendChild(line);
      if(focus){
        placeCaretAtEnd(input);
        input.focus();
      }
      scrollToBottom();
      return input;
    }

    function placeCaretAtEnd(el){
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(el);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function onPaste(e){
      e.preventDefault();
      const text = (e.clipboardData || window.clipboardData).getData('text');
      document.execCommand('insertText', false, text);
    }

    function onInputKeyDown(e){
      const input = e.currentTarget;
      if(e.key === 'Enter'){
        e.preventDefault();
        const cmd = input.innerText.replace(/\u00A0/g,' ').trimEnd();
        if(cmd.length === 0){
          // blank: just emit new prompt
          pushOutput('');
          input.parentElement.querySelector('.cursor').remove();
          createPromptLine();
          historyIndex = history.length;
          return;
        }
        history.push(cmd);
        historyIndex = history.length;
        // finalize current line
        input.contentEditable = 'false';
        input.classList.add('muted');
        input.parentElement.querySelector('.cursor').remove();
        // echo the command as output (no custom commands executed)
        pushOutput('\n' + cmd);
        // show a simulated response (optional) — here we keep it simple and show nothing more.
        // new prompt
        createPromptLine();
      } else if(e.key === 'ArrowUp'){
        e.preventDefault();
        if(history.length === 0) return;
        historyIndex = Math.max(0, historyIndex - 1);
        input.innerText = history[historyIndex] || '';
        placeCaretAtEnd(input);
      } else if(e.key === 'ArrowDown'){
        e.preventDefault();
        if(history.length === 0) return;
        historyIndex = Math.min(history.length, historyIndex + 1);
        input.innerText = historyIndex === history.length ? '' : (history[historyIndex] || '');
        placeCaretAtEnd(input);
      } else if(e.key === 'Tab'){
        e.preventDefault();
        document.execCommand('insertText', false, '    ');
      } else if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l'){
        e.preventDefault();
        clearTerminal();
      } else if((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'c'){
        e.preventDefault();
        // Cancel current input: print ^C
        const parent = input.parentElement;
        input.contentEditable = 'false';
        input.classList.add('muted');
        input.parentElement.querySelector('.cursor').remove();
        const caret = document.createElement('div');
        caret.className = 'line';
        caret.innerHTML = '<span class="output">^C</span>';
        terminal.appendChild(caret);
        createPromptLine();
      }
    }

    function pushOutput(text){
      // text may contain newlines
      if(text.startsWith('\n')) text = text.slice(1);
      const lines = text.split('\n');
      for(const ln of lines){
        const out = document.createElement('div');
        out.className = 'line output';
        out.textContent = ln;
        terminal.appendChild(out);
      }
      scrollToBottom();
    }

    function clearTerminal(){
      terminal.innerHTML = '';
      createPromptLine(false);
    }

    function scrollToBottom(){
      terminal.scrollTop = terminal.scrollHeight;
    }

    // Start with a welcome message and initial prompt
    pushOutput('Welcome to the web terminal emulator — no custom commands installed.');
    pushOutput('Type anything and press Enter. Use \u2191 / \u2193 to browse history.');
    createPromptLine();

    // Focus handling: click anywhere to focus input
    document.querySelector('.frame').addEventListener('click', (e)=>{
      const inputs = terminal.querySelectorAll('.input[contenteditable="true"]');
      if(inputs.length) inputs[inputs.length-1].focus();
    });

    // Accessibility: keyboard focus on container focuses input
    terminal.addEventListener('focus', ()=>{
      const inputs = terminal.querySelectorAll('.input[contenteditable="true"]');
      if(inputs.length) inputs[inputs.length-1].focus();
    });

    // Initialize history index
    historyIndex = history.length;