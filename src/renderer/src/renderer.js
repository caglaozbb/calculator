// Renderer process logic

class Calculator {
  constructor(displayElement, memoryIndicatorElement) {
    this.displayElement = displayElement;
    this.memoryIndicatorElement = memoryIndicatorElement;
    
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
    
    this.memoryValue = 0;
    this.memoryRecalled = false; 
    
    this.updateDisplay();
    this.updateMemoryIndicator();
  }

  formatNumber(num) {
    if (isNaN(num)) return 'Error';
    if (!isFinite(num)) return 'Error';
    
    let str = num.toString();
    if (str.length > 12) {
      if (Math.abs(num) > 999999999999) {
        return num.toExponential(6);
      }
      return str.slice(0, 12);
    }
    return str;
  }

  updateDisplay() {
    this.displayElement.innerText = this.currentValue;
  }

  updateMemoryIndicator() {
    if (this.memoryValue !== 0) {
      this.memoryIndicatorElement.innerText = 'M';
    } else {
      this.memoryIndicatorElement.innerText = '';
    }
  }

  appendNumber(number) {

    if (this.memoryRecalled) {
      this.memoryRecalled = false;
      this.currentValue = number;
      this.waitingForSecondOperand = false; 
    } else if (this.waitingForSecondOperand) {
      this.currentValue = number;
      this.waitingForSecondOperand = false;
    } else {
      if (this.currentValue === '0' && number !== '00') {
        this.currentValue = number;
      } else if (this.currentValue === '0' && number === '00') {
      } else {
        if (this.currentValue.length >= 12) return;
        this.currentValue += number;
      }
    }
    this.updateDisplay();
  }

  appendDecimal() {
    if (this.waitingForSecondOperand) {
      this.currentValue = '0.';
      this.waitingForSecondOperand = false;
      this.updateDisplay();
      return;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
      this.updateDisplay();
    }
  }

  handleOperator(nextOperator) {
    const inputValue = parseFloat(this.currentValue);

    if (this.operator && this.waitingForSecondOperand) {
      this.operator = nextOperator;
      return;
    }

    if (this.previousValue == null) {
      this.previousValue = inputValue;
    } else if (this.operator) {
      const result = this.performCalculation(this.operator, this.previousValue, inputValue);
      this.currentValue = this.formatNumber(result);
      this.previousValue = result;
      this.updateDisplay();
    }

    this.waitingForSecondOperand = true;
    this.operator = nextOperator;
    this.memoryRecalled = false;
  }

  performCalculation(operator, left, right) {
    switch (operator) {
      case '+': return left + right;
      case '-': return left - right;
      case '×': return left * right;
      case '÷': 
        if (right === 0) return NaN; 
        return left / right;
      default: return right;
    }
  }

  calculate() {
    if (this.operator === null || this.previousValue === null) return;

    const inputValue = parseFloat(this.currentValue);
    const result = this.performCalculation(this.operator, this.previousValue, inputValue);
    
    this.currentValue = this.formatNumber(result);
    this.operator = null;
    this.previousValue = null;
    this.waitingForSecondOperand = true; //
    this.memoryRecalled = false;
    this.updateDisplay();
  }

  clearEntry() {
    this.currentValue = '0';
    this.updateDisplay();
  }

  clearAll() {
    this.currentValue = '0';
    this.previousValue = null;
    this.operator = null;
    this.waitingForSecondOperand = false;
    this.memoryRecalled = false;
    this.updateDisplay();
  }

  backspace() {
    if (this.waitingForSecondOperand || this.currentValue === 'Error' || this.currentValue === 'Infinity') {
      this.currentValue = '0';
    } else {
      this.currentValue = this.currentValue.slice(0, -1);
      if (this.currentValue === '' || this.currentValue === '-') {
        this.currentValue = '0';
      }
    }
    this.updateDisplay();
  }

  sqrt() {
    const val = parseFloat(this.currentValue);
    if (val < 0) {
      this.currentValue = 'Error'; 
    } else {
      this.currentValue = this.formatNumber(Math.sqrt(val));
    }
    this.waitingForSecondOperand = true;
    this.updateDisplay();
  }

  percent() {
    const val = parseFloat(this.currentValue);
    this.currentValue = this.formatNumber(val / 100);
    this.waitingForSecondOperand = true;
    this.updateDisplay();
  }

  // Memory Functions
  memoryAdd() {
    if (this.operator && !this.waitingForSecondOperand) {
      const inputValue = parseFloat(this.currentValue);
      const result = this.performCalculation(this.operator, this.previousValue, inputValue);
      this.currentValue = this.formatNumber(result);
      this.operator = null;
      this.previousValue = null;
      this.waitingForSecondOperand = true;
      this.updateDisplay();
    }
    
    const val = parseFloat(this.currentValue);
    if (!isNaN(val) && isFinite(val)) {
      this.memoryValue += val;
    }
    this.waitingForSecondOperand = true;
    this.memoryRecalled = false;
    this.updateMemoryIndicator();
  }

  memorySubtract() {
    if (this.operator && !this.waitingForSecondOperand) {
         const inputValue = parseFloat(this.currentValue);
         const result = this.performCalculation(this.operator, this.previousValue, inputValue);
         this.currentValue = this.formatNumber(result);
         this.operator = null;
         this.previousValue = null;
         this.waitingForSecondOperand = true;
         this.updateDisplay();
    }

    const val = parseFloat(this.currentValue);
    if (!isNaN(val) && isFinite(val)) {
      this.memoryValue -= val;
    }
    this.waitingForSecondOperand = true;
    this.memoryRecalled = false;
    this.updateMemoryIndicator();
  }

  memoryRecallClear() {
    if (this.memoryRecalled) {
      this.memoryValue = 0;
      this.memoryRecalled = false;
      this.updateMemoryIndicator();
    } else {
      this.currentValue = this.formatNumber(this.memoryValue);
      this.waitingForSecondOperand = true;
      this.memoryRecalled = true;
      this.updateDisplay();
    }
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  const memoryInd = document.getElementById('memory-indicator');
  
  const calc = new Calculator(display, memoryInd);
  
  const buttons = document.querySelectorAll('button');
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const value = btn.dataset.value;
      
      if (action !== 'memory' || value !== 'MRC') {
        calc.memoryRecalled = false; 
      }

      switch (action) {
        case 'number':
          calc.appendNumber(value);
          break;
        case 'operator':
          calc.handleOperator(value);
          break;
        case 'decimal':
          calc.appendDecimal();
          break;
        case 'calculate':
          calc.calculate();
          break;
        case 'clear':
          if (value === 'AC') calc.clearAll();
          if (value === 'CE') calc.clearEntry();
          break;
        case 'delete':
          calc.backspace();
          break;
        case 'math':
          if (value === 'sqrt') calc.sqrt();
          if (value === '%') calc.percent();
          break;
        case 'memory':
          if (value === 'M+') calc.memoryAdd();
          if (value === 'M-') calc.memorySubtract();
          if (value === 'MRC') calc.memoryRecallClear();
          break;
      }
    });
  });

  document.getElementById('minimize')?.addEventListener('click', () => {
    if (window.electron && window.electron.ipcRenderer) {
      window.electron.ipcRenderer.send('minimize-window')
    }
  })
  
  document.getElementById('close')?.addEventListener('click', () => {
     if (window.electron && window.electron.ipcRenderer) {
       window.electron.ipcRenderer.send('close-window')
     }
  })
});
