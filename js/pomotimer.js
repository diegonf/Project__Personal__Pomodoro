import { playAudio } from "./pomosettings.js";

// ********************************************* Call all the functions  *********************************************
export function callTimer(){
  // >> preLoad function
  carregaTimer();

  // >> Buttons Pomodoro/ Short Break/ Long Break
  const botaoEtapaPomo = document.querySelectorAll('[data-botao-pomo]');
  botaoEtapaPomo.forEach(input => {
    input.addEventListener('click', () => {
      selecionaPomoTimer(input);
    });
  });

  //>> Buttons Play/ Pause/ Stop
  const botaoStart = document.querySelector('[data-botao-start]'); // selecionando o botão start
  botaoStart.addEventListener('click', () => {
    clearTimeout(buttonInterval);
    buttonInterval = setTimeout(startTimer, 200);
  });
  const botaoPausar = document.querySelector('[data-botao-pausar]'); // selecionando o botão pause
  botaoPausar.addEventListener('click', () => {
    clearTimeout(buttonInterval);
    buttonInterval = setTimeout(pausarTimer, 200);
  });
  const botaoFinalizar = document.querySelector('[data-botao-finalizar]'); // selecionando o botão finalizar
  botaoFinalizar.addEventListener('click', () => {
    finalizarTimer();
  });
}

// ********************************************* Carrega Timer  *********************************************
function carregaTimer () {
  // debugger;
  const dadosEstadoAtual = JSON.parse(localStorage.getItem('estadoPomodoro')) || {};
  const statusRodando = dadosEstadoAtual.statusRodando;

  if(statusRodando == null || statusRodando == false) {
    resetTimer();
  } else {
    askContinueRunning();
  } 
}

// ********************************************* START Time  *********************************************
let myInterval;
var buttonInterval;
let running;
function startTimer() {
  stopCurrentTimer();
  running = true;
  const dadosEstadoAtual = JSON.parse(localStorage.getItem('estadoPomodoro'));
  const varConfig = JSON.parse(localStorage.getItem('config'));

  // atualiza statusRodando para true e atualiza local storage
  const statusRodando = true;
  setDados(dadosEstadoAtual.minutes, dadosEstadoAtual.seconds, dadosEstadoAtual.timerAtivo, statusRodando, dadosEstadoAtual.today);
  setDadosAtuais();

  // Pega os dados do timer de acordo com as configurações e o estado atual
  const timerAtivo = dadosEstadoAtual.timerAtivo; // Timer ativo
  const duration = getTimerAtivo(timerAtivo); // Timer de acordo com a configuração do timer ativo
  const timerInicial = parseInt(dadosEstadoAtual.minutes)*60 + parseInt(dadosEstadoAtual.seconds); // Timer inicial LS
  var timer = timerInicial;
  
  // Pega os dados do contador pomodoro
  const contadorConfig = parseInt(varConfig.qtdPomoAteLong);
  var contadorPomo = JSON.parse(localStorage.getItem('contadorPomodoro'));

  // Checa se timer está no inicio ou se está começando de onde parou a ultima vez
  var minutes, seconds;
  if (duration == timerInicial){
    // Toca alarme para inciar contador
    const alarmStart = document.querySelector('#som-alarme-start'); // selecionando o som do alarme
    playAudio(alarmStart);
    // Checa se o timer é um pomodoro para adicionar ao contador e mudar visualização
    if (timerAtivo == "startPomo") {
      contadorPomo++; // Adiciona novo pomodoro para o contador
      localStorage.setItem('contadorPomodoro', contadorPomo);
      setDadosAtuais();
    }
  }
  
  // Variaveis para serem usadas no timer
  var timerPC, changeTimer;
  const dataInicial = new Date();
  const contadorAuto = varConfig.rodarAutomatico;

  myInterval = setTimeout(funTimer(), 0);
  function funTimer() {
    const dataAtual = new Date();  
    timerPC = parseInt((dataAtual.getTime() - dataInicial.getTime())/1000); //pega o tempo transcorrido em segundos
    
    if (timer < 0) {
      const alarmEnd = document.querySelector('#som-alarme-end'); // selecionando o som do alarme

      playAudio(alarmEnd);
      stopCurrentTimer();
        if (timerAtivo == 'startPomo') {
          if (!(contadorPomo % contadorConfig == 0)){
            changeTimer = 'breakPomo';
          } else {
            changeTimer = 'longBreakPomo';
          }
        } else {
          changeTimer = 'startPomo';
        }
        
        setDadosIniciaisLS(changeTimer);
        setDadosAtuais();
        if(contadorAuto) {
          startTimer();
        } 
    } else {
      minutes = parseInt(timer / 60, 10);
      seconds = parseInt(timer % 60, 10);
      setLayoutCircleAndTimer();
      setDados(minutes, seconds, timerAtivo, statusRodando, dataAtual);
      myInterval = setTimeout(funTimer, 500);
    };
    timer = timerInicial - timerPC;
  }
}

// ********************************************* Pause Timer *********************************************
function pausarTimer () {
  stopCurrentTimer(); // para o timer

  var dadosEstadoAtual= JSON.parse(localStorage.getItem('estadoPomodoro'));
  const statusRodando = 'pause';
  setDados(dadosEstadoAtual.minutes, dadosEstadoAtual.seconds, dadosEstadoAtual.timerAtivo, statusRodando, dadosEstadoAtual.dataAtual);
  setDadosAtuais(); 
}

// ********************************************* Stop Timer  *********************************************
function finalizarTimer () {
  // Access to window when stop button is clicked
  const body = document.querySelector('[data-body]');
  const endSessionWindow = document.querySelector('[data-endsession]');
  endSessionWindow.style.display = "flex";
  body.style.overflow = "hidden";

  // function to scroll the page to the position of the pomodoro timer, so the user can actually hit yes or no.
  let pageElement = document.getElementById("pomodorotimer");    
  let positionX = 0, positionY = 0;    
  while(pageElement != null){        
      positionX += pageElement.offsetLeft;        
      positionY += pageElement.offsetTop;        
      pageElement = pageElement.offsetParent;        
      window.scrollTo(positionX, positionY - 100);    
  }

  //yesButton pressed
  const yesButton = document.querySelector('[data-yesbutton-reset]');
  yesButton.addEventListener('click', () => {
    endSessionWindow.style.display = "none";
    body.style.overflow = "visible";
    resetTimer()
  });
  //noButton pressed
  const noButton = document.querySelector('[data-nobutton-reset]');
  noButton.addEventListener('click', () => {
    endSessionWindow.style.display = "none";
    body.style.overflow = "visible"; 
  });
  //button X pressed
  const xButton = document.querySelector('[data-close-endsession]');
  xButton.addEventListener('click', () => {
    endSessionWindow.style.display = "none";
    body.style.overflow = "visible"; 
  });
}

// ********************************************* Function to change timer by user  *********************************************
function selecionaPomoTimer(input){
  stopCurrentTimer(); // para o timer
  var minutes, seconds, timer, timerAtivo, statusRodando;

  timerAtivo = input.dataset.botaoPomo;
  statusRodando = false;

  timer = getTimerAtivo(timerAtivo);
  minutes = parseInt(timer / 60, 10);
  seconds = parseInt(timer % 60, 10);
  setDados(minutes, seconds, timerAtivo, statusRodando, '');

  setDadosAtuais();
};

// ********************************************* Print current timer on screen *********************************************
function setDadosAtuais() {
  const dadosEstadoAtual = JSON.parse(localStorage.getItem('estadoPomodoro'));
  
  // >>> Altera o estilo do botao do timer selecionado
  const botaoTimerAtivo = document.querySelector("[data-botao-pomo=\"" + dadosEstadoAtual.timerAtivo + "\"]");
  const botoesTimers = document.querySelectorAll('[data-botao-pomo]');
  botaoTimerAtivo.classList.add('active');
  botoesTimers.forEach(botao => {
    if (botao.dataset.botaoPomo != botaoTimerAtivo.dataset.botaoPomo){
      botao.classList.remove('active');
    }
  });

  // >>> Chama função que define o layout do circulo do timer e o o proprio timer
  setLayoutCircleAndTimer();

  // >>> Checa e muda o icone para aparecer somente o Play ou Stop dependendo do caso
  const botaoStart = document.querySelector('[data-botao-start]');
  const botaoPause = document.querySelector('[data-botao-pausar]');
  const statusRodando = dadosEstadoAtual.statusRodando;
  
  if(statusRodando == null) {
    botaoStart.style.display = "flex";
    botaoPause.style.display = "none";
    stopCurrentTimer();
  } else {
    if (statusRodando == true) {
      botaoStart.style.display = "none";
      botaoPause.style.display = "flex";
    } else if (statusRodando == 'pause') {
      botaoStart.style.display = "flex";
      botaoPause.style.display = "none";
    } else{
      botaoStart.style.display = "flex";
      botaoPause.style.display = "none";
    }
  }

  // >>> Arruma texto quantidade de pomodoros
  var contadorPomo = JSON.parse(localStorage.getItem('contadorPomodoro'));
  const textoCont = document.querySelector('[data-cont-pomo]');
  if (contadorPomo == null){
    contadorPomo = 0;
    localStorage.setItem('contadorPomodoro', 0);
  }
  textoCont.textContent = 'Pomos: #' + contadorPomo;

  // >>> Arruma cores de acordo com o timer rodando
  // const r = document.querySelector(':root');
  // if ( dadosEstadoAtual.timerAtivo == "startPomo") {
  //   r.style.setProperty('--bgrtool', '');
  //   r.style.setProperty('--bgrinsidetool', '');
  // } else if ( dadosEstadoAtual.timerAtivo == "breakPomo") {
  //   r.style.setProperty('--bgrtool', '#c2e5e5');
  //   r.style.setProperty('--bgrinsidetool', '#94aaac');
  // } else {
  //   r.style.setProperty('--bgrtool', '#d1d5f3');
  //   r.style.setProperty('--bgrinsidetool', '#a0a3bd');
  // };  
};


// ********************************************* Support functions  *********************************************
//Function that ask the user if he/she wants to continue to run where it was left off.
function askContinueRunning(){
  // Access to window when page is accessed
  const body = document.querySelector('[data-body]');
  const contRunWindows = document.querySelector('[data-contrunning]');
  contRunWindows.style.display = "flex";
  body.style.overflow = "hidden";

  //yesButton pressed
  const yesButton = document.querySelector('[data-yesbutton]');
  yesButton.addEventListener('click', () => {
    contRunWindows.style.display = "none";
    body.style.overflow = "visible";
   
    setDadosAtuais();
    startTimer();
  });
  //noButton pressed
  const noButton = document.querySelector('[data-nobutton]');
  noButton.addEventListener('click', () => {
    contRunWindows.style.display = "none";
    body.style.overflow = "visible"; 
    resetTimer();
  });
  //button X pressed
  const xButton = document.querySelector('[data-close-contrunning]');
  xButton.addEventListener('click', () => {
    contRunWindows.style.display = "none";
    body.style.overflow = "visible"; 
    resetTimer();
  });
  
}

//Return 2 dates' difference in minutes
export function diffDatas (dataEstadoAtual) {
  const dataAgora = new Date();
  const dataInicio = Date.parse(dataEstadoAtual); //Ja retorna em ms
  const dataFim = dataAgora.getTime();
  
  const diffTimeMs = dataFim - dataInicio; // miliseconds 
  const diffTimeMin = diffTimeMs/(1000 * 60); // Dif in minutes

  return diffTimeMin;
}

// Get total duration of active timer according to the settings
function getTimerAtivo (timerAtivo) {
  const varConfig = JSON.parse(localStorage.getItem('config'));
  if (timerAtivo == null) { timerAtivo = 'startPomo';}

  var timer;

  const timers = {
    startPomo:input => {
      timer = parseInt(varConfig.timePomMin)*60 + parseInt(varConfig.timePomSec);
      return timer;
    },
    breakPomo:input => {
      timer = parseInt(varConfig.timeBreakMin) * 60 + parseInt(varConfig.timeBreakSec);
      return timer;
    },
    longBreakPomo:input => {
      timer = parseInt(varConfig.timeLongMin) * 60 + parseInt(varConfig.timeLongSec);
      return timer;
    }
  };
  return timers[timerAtivo]();
}

//Function to reset timer to the Focus Time session and the count to 0
export function resetTimer() {
  stopCurrentTimer();

  localStorage.removeItem('estadoPomodoro');
  localStorage.removeItem('contadorPomodoro');
  localStorage.setItem('contadorPomodoro', 0);
  setDadosIniciaisLS('startPomo'); 
  setDadosAtuais();
}

//Set data to local storage
export function setDados (minutes, seconds, timerAtivo, statusRodando, dataAtual) {
  const dadosEstadoAtual = {
    minutes,
    seconds,
    timerAtivo,
    statusRodando,
    dataAtual
  };
  localStorage.setItem('estadoPomodoro', JSON.stringify(dadosEstadoAtual));
}

//Set initial timer's values according to settings
function setDadosIniciaisLS (timerAtivo) {
  const timer = getTimerAtivo(timerAtivo);
  const minutes = parseInt(timer / 60, 10);
  const seconds = parseInt(timer % 60, 10);

  setDados(minutes, seconds, timerAtivo, false, ''); 
}

// Print timer and circle layout on screen
function setLayoutCircleAndTimer () {
  const dadosEstadoAtual = JSON.parse(localStorage.getItem('estadoPomodoro'));

  // >>> Timer
  const min = parseInt(dadosEstadoAtual.minutes);
  const sec = parseInt(dadosEstadoAtual.seconds);
  const minutes = min < 10 ? "0" + min : min;
  const seconds = sec < 10 ? "0" + sec : sec;
  
  const display = document.querySelector('[data-timer]');
  const displayTimer = minutes + ":" + seconds
  display.textContent = displayTimer;

  const pageTitle = document.querySelector('title');
  let title;
  if(running){  
    title = displayTimer;
    if(dadosEstadoAtual.timerAtivo == "startPomo"){
      title = title + ' Focus Time'
    } else if (dadosEstadoAtual.timerAtivo == "breakPomo") {
      title = title + ' Short Break'
    } else {
      title = title + ' Long Break'
    }

  } else {
    title = 'Pomodoro Timer';
  }
  pageTitle.textContent = title;

  //Drawing the circle with canvas
  const timer = getTimerAtivo(dadosEstadoAtual.timerAtivo)
  const timerOffset = (min * 60 + sec)/timer;
  const canvas = document.querySelector('[data-mycanvas]');
  const c = canvas.getContext('2d');
  let cX = 128, cY = 128, r = 124, lw=8, sAng, eAng, rot;

  if (timerOffset <= 1 && timerOffset >= 0.75) eAng = ((-2 * timerOffset) + 3.5) * Math.PI;
  if(timerOffset < 0.75 && timerOffset > 0) eAng = ((-2 * timerOffset) + 1.5) * Math.PI;
  if (timerOffset <= 0) eAng = -0.5 * Math.PI
  sAng = -0.5 * Math.PI;

  c.clearRect(0, 0, canvas.width, canvas.height);
  c.beginPath();
  c.strokeStyle = '#a0a0a0';
  c.lineWidth = lw;
  c.arc(cX, cY, r, sAng, eAng, true);
  c.stroke();
  c.closePath();
}

//Stop setTimeout in case it is running
function stopCurrentTimer() {
  while(myInterval || running){
    clearInterval(myInterval);
    myInterval = null;
    running = false;
  }
}








