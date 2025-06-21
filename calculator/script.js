

  (() => {
    const display = document.getElementById('display');
    const buttons = document.querySelectorAll('.buttons button');
    let expression = '';
    let lastInput = ''; // Track last input for validation

    // Convert symbols to JS operators for evaluation
    const toJSExpr = expr => expr.replace(/÷/g, '/').replace(/×/g, '*').replace(/−/g, '-');

    // Safely evaluate expression
    const safeEval = expr => {
      try {
        if (/[\+\-\*\/\.]$/.test(expr)) return null; // Ends with operator, invalid
        const result = eval(expr);
        if (result === Infinity || result === -Infinity || isNaN(result)) return 'Error';
        return result;
      } catch {
        return 'Error';
      }
    };

    // Update display and show real-time result
    const updateDisplay = () => {
      if (!expression) {
        display.textContent = '0';
        return;
      }
      display.textContent = expression;
      const result = safeEval(toJSExpr(expression));
      if (result !== null && result !== 'Error') {
        display.textContent = result;
      }
    };

    // Handle button clicks
    buttons.forEach(button => {
      button.addEventListener('click', () => {
        if (button.id === 'clear') {
          expression = '';
          lastInput = '';
          display.textContent = '0';
          return;
        }

        if (button.id === 'equals') {
          const result = safeEval(toJSExpr(expression));
          if (result === null || result === 'Error') {
            display.textContent = 'Error';
            expression = '';
            lastInput = '';
          } else {
            expression = String(result);
            display.textContent = expression;
            lastInput = '';
          }
          return;
        }

        const num = button.getAttribute('data-num');
        const op = button.getAttribute('data-op');

        if (num !== null) {
          // Prevent multiple decimals in the same number
          if (num === '.' && lastInput.includes('.')) return;
          expression += num;
          lastInput = (lastInput || '') + num;
          display.textContent = expression;
          updateDisplay();
        } else if (op !== null) {
          if (!expression) return; // Don't start with operator
          if (/[+\-×÷−]$/.test(expression)) {
            expression = expression.slice(0, -1) + op; // Replace last operator
          } else {
            expression += op;
          }
          lastInput = '';
          display.textContent = expression;
        }
      });
    });

    // Keyboard support
    window.addEventListener('keydown', e => {
      const key = e.key;

      if ((key >= '0' && key <= '9') || key === '.') {
        if (key === '.' && lastInput.includes('.')) {
          e.preventDefault();
          return;
        }
        expression += key;
        lastInput = (lastInput || '') + key;
        display.textContent = expression;
        updateDisplay();
        e.preventDefault();
      } else if (['+', '-', '*', '/'].includes(key)) {
        const mapOps = { '+': '+', '-': '−', '*': '×', '/': '÷' };
        if (!expression) return;
        if (/[+\-×÷−]$/.test(expression)) {
          expression = expression.slice(0, -1) + mapOps[key];
        } else {
          expression += mapOps[key];
        }
        lastInput = '';
        display.textContent = expression;
        e.preventDefault();
      } else if (key === 'Enter' || key === '=') {
        const result = safeEval(toJSExpr(expression));
        if (result === null || result === 'Error') {
          display.textContent = 'Error';
          expression = '';
          lastInput = '';
        } else {
          expression = String(result);
          display.textContent = expression;
          lastInput = '';
        }
        e.preventDefault();
      } else if (key === 'Backspace') {
        expression = expression.slice(0, -1);
        display.textContent = expression || '0';
        lastInput = '';
        updateDisplay();
        e.preventDefault();
      } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        expression = '';
        display.textContent = '0';
        lastInput = '';
        e.preventDefault();
      }
    });
  })();