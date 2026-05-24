const status = document.getElementById('status');
const runBtn = document.getElementById('runBtn');
const stopBtn = document.getElementById('stopBtn');
const outputEl = document.getElementById('output');
const stdinEl = document.getElementById('stdin');
const codeEl = document.getElementById('code');
const timeoutEl = document.getElementById('timeout');
const clearOutBtn = document.getElementById('clearOut');
const copyOut = document.getElementById('copyOut');
const downloadBtn = document.getElementById('downloadBtn');
const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const ex1 = document.getElementById('ex1');
const ex2 = document.getElementById('ex2');
const ex3 = document.getElementById('ex3');

let pyodide = null;
let controller = null;

function appendOutput(text) {
  outputEl.textContent += text;
  outputEl.scrollTop = outputEl.scrollHeight;
}

window.get_input = function(prompt) {
  if (prompt) appendOutput(prompt);
  const lines = (stdinEl.value || '').split(/\r?\n/);
  if (!window._py_input_index) window._py_input_index = 0;
  if (window._py_input_index >= lines.length) throw new Error('EOFError: EOF when reading a line');
  const val = lines[window._py_input_index];
  window._py_input_index++;
  appendOutput(val + '\n');
  return val;
};

window.write_output = function(s) { appendOutput(s); };

async function main() {
  status.textContent = 'Loading Pyodide...';
  pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.23.4/full/' });
  status.textContent = 'Pyodide loaded';
  appendOutput('Pyodide ready.\n');
}
main();

runBtn.addEventListener('click', async () => {
  if (!pyodide) return alert('Pyodide not loaded yet.');
  window._py_input_index = 0;
  appendOutput('\n--- Running program ---\n');
  runBtn.disabled = true;
  stopBtn.disabled = false;
  controller = new AbortController();
  const signal = controller.signal;

  const setup = `import sys, builtins
from js import write_output, get_input
class _J:
    def write(self,s):
        try: write_output(str(s))
        except: pass
    def flush(self): pass
sys.stdout=_J()
sys.stderr=_J()
builtins.input=lambda p='': get_input(p)`;

  try { await pyodide.runPythonAsync(setup,{signal}); } 
  catch(e) { appendOutput(e+'\n'); }

  try {
    await pyodide.runPythonAsync(codeEl.value,{signal});
    appendOutput('\n--- Program finished ---\n');
  } catch(e) { appendOutput('\n[Exception] '+e+'\n'); }
  runBtn.disabled = false;
  stopBtn.disabled = true;
  controller=null;
});

stopBtn.addEventListener('click',()=>{
  if(controller){
    controller.abort();
    appendOutput('\n--- Aborted ---\n');
    runBtn.disabled=false;
    stopBtn.disabled=true;
    controller=null;
  }
});

clearOutBtn.addEventListener('click',()=>outputEl.textContent='');
copyOut.addEventListener('click',()=>navigator.clipboard.writeText(outputEl.textContent||''));

downloadBtn.addEventListener('click',()=>{
  const b=new Blob([codeEl.value],{type:'text/x-python'});
  const u=URL.createObjectURL(b);
  const a=document.createElement('a');
  a.href=u;
  a.download='program.py';
  a.click();
  URL.revokeObjectURL(u);
});

uploadBtn.addEventListener('click',()=>fileInput.click());
fileInput.addEventListener('change',(e)=>{
  const f=e.target.files[0];
  if(!f)return;
  const r=new FileReader();
  r.onload=()=>{codeEl.value=r.result};
  r.readAsText(f);
});

ex1.addEventListener('click',()=>{
  codeEl.value="print('Hello from Python')\nfor i in range(3):\n    print('line',i)";
});
ex2.addEventListener('click',()=>{
  codeEl.value="name=input('Enter name: ')\nage=int(input('Age: '))\nprint(f'Hello {name}, you are {age}')";
});
ex3.addEventListener('click',()=>{
  codeEl.value="n=int(input('n: '))\nfor i in range(1,n+1):\n    print(i,'squared=',i*i)";
});
