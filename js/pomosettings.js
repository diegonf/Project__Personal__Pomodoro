import { callTimer, resetTimer } from "./pomotimer.js";

// ********************************************* Call functions  *********************************************
export function callTimerSettings() {

  // funciton to load page
  carregaTimerConfig();
  
  // Access to settings' window when pressed settings' button
  const body = document.querySelector('[data-body]');
  const pomoSettings = document.querySelector('[data-pomo-settings]');
  const settingsButton = document.querySelector('[data-botao-settings]');
  settingsButton.addEventListener('click', () => {
    carregaTimerConfig(); // call load function to rewrite the current data in the inputs (in case user has changed them)
    pomoSettings.style.display = "flex";
    body.style.overflow = "hidden";
  });

  // Button to close settings' window
  const closeButton = document.querySelector('[data-close-settings]');
  closeButton.addEventListener('click', () => {
    pomoSettings.style.display = "none";
    body.style.overflow = "visible";
  });

  // Button save settings
  const saveButton = document.querySelector('[data-settings-save]');
  const allInputs = document.querySelectorAll('[data-input]');
  saveButton.addEventListener('click', (event) => {
    const regex = new RegExp('[0-9]{1,2}');
    var isValid = true;
    allInputs.forEach(input => {
      if (input.value == "" || input.value == null || !regex.test(input.value)){
        isValid = false;
      } 
    });

    if(isValid) {
      event.preventDefault();
      salvarDadosConfig();
      pomoSettings.style.display = "none";
      body.style.overflow = "visible";
    }   
  });

  // 'Hide Tasks' feature
  const hideTask = JSON.parse(localStorage.getItem('hideTasks')) || false; //starting
  checkHideTasks(hideTask);

  const tasksBlock = document.querySelector('[data-pomotasks-block]');
  const hideInput = document.querySelector('[data-hide-tasks]');
  hideInput.addEventListener('change', function() {
    checkHideTasks(this.checked);
    localStorage.setItem('hideTasks', JSON.stringify(this.checked));
  })

  // Audio feature
  const audioStatus = JSON.parse(localStorage.getItem('audioStatus')); //starting
  checkPlayAudio(audioStatus);

  const audioControl = document.querySelector('[data-botao-volume]');
  audioControl.addEventListener('click', () => {  
    const audioStatus = JSON.parse(localStorage.getItem('audioStatus'));
    localStorage.setItem('audioStatus', JSON.stringify(!audioStatus));
    checkPlayAudio(!audioStatus);
  })

  window.addEventListener('resize', () => {
    const x = window.innerWidth || document.documentElement.clientWidth || document.getElementsByTagName('body')[0].clientWidth;
    if (x<=650) {
      tasksBlock.style.display = "flex";
      hideInput.checked = false;
      localStorage.setItem('hideTasks', JSON.stringify(false));
    };
  
  }, true);
}

// ********************************************* Carrega Config  *********************************************
export function carregaTimerConfig(){
  var timePomMin, timeBreakMin, timePomSec, timeBreakSec, timeLongMin, timeLongSec, qtdPomoAteLong, rodarAutomatico;
  const dadosConfigAtual = JSON.parse(localStorage.getItem('config')) || {};
  
  timePomMin = dadosConfigAtual.timePomMin;
  
  if (timePomMin == null) {
    timePomMin = 25;
    timePomSec = 0;
    timeBreakMin = 5;
    timeBreakSec = 0;
    timeLongMin = 15;
    timeLongSec = 0;
    qtdPomoAteLong = 4;
    rodarAutomatico = true;
    
  } else {
    timePomMin = dadosConfigAtual.timePomMin;
    timePomSec = dadosConfigAtual.timePomSec;
    timeBreakMin = dadosConfigAtual.timeBreakMin;
    timeBreakSec = dadosConfigAtual.timeBreakSec;
    timeLongMin = dadosConfigAtual.timeLongMin;
    timeLongSec = dadosConfigAtual.timeLongSec;
    qtdPomoAteLong = dadosConfigAtual.qtdPomoAteLong;
    rodarAutomatico = dadosConfigAtual.rodarAutomatico;
  }

  const configSelecionada = [
    timePomMin,
    timePomSec,
    timeBreakMin,
    timeBreakSec,
    timeLongMin,
    timeLongSec,
    qtdPomoAteLong,
    rodarAutomatico
  ];
  setDadosConfig(timePomMin, timePomSec, timeBreakMin, timeBreakSec, timeLongMin, timeLongSec, qtdPomoAteLong, rodarAutomatico);
  
  const settingsInputs = document.querySelectorAll('[data-input]');
  const settingsAutoCont = document.querySelector('[data-input-autocont]')
  let i=0;
  settingsInputs.forEach(input => {
    input.value = configSelecionada[i];
    i++;
  });
  settingsAutoCont.checked = configSelecionada[settingsInputs.length];
  
}

// ********************************************* Salva Nova Config  *********************************************
export function salvarDadosConfig () {

  const settingsAutoCont = document.querySelector('[data-input-autocont]')
  const settingsInputs = document.querySelectorAll('[data-input]');
  let i=1;
  var dadosConfigAtual = [];
  settingsInputs.forEach(input => {
    dadosConfigAtual = [...dadosConfigAtual, input.value];
    i++;
  });

  dadosConfigAtual = [...dadosConfigAtual, settingsAutoCont.checked];

  setDadosConfig(dadosConfigAtual[0],dadosConfigAtual[1],dadosConfigAtual[2],dadosConfigAtual[3],dadosConfigAtual[4],dadosConfigAtual[5],dadosConfigAtual[6], dadosConfigAtual[7]);

  resetTimer();
  callTimer();
}

// ********************************************* Funções Suporte  *********************************************
function setDadosConfig (timePomMin, timePomSec, timeBreakMin, timeBreakSec, timeLongMin, timeLongSec, qtdPomoAteLong, rodarAutomatico) {
  const configSelecionada = {
    timePomMin,
    timePomSec,
    timeBreakMin,
    timeBreakSec,
    timeLongMin,
    timeLongSec,
    qtdPomoAteLong,
    rodarAutomatico
  };

  localStorage.setItem('config', JSON.stringify(configSelecionada));
}

function checkHideTasks(checked){
  const hideInput = document.querySelector('[data-hide-tasks]');
  
  const tasksBlock = document.querySelector('[data-pomotasks-block]');
  const timerBlock = document.querySelector('[data-pomotimer-block]');
  const pomoContainer = document.querySelector('[data-pomo-container]');


  hideInput.checked = checked;
  if (checked) {
    tasksBlock.style.display = "none";
    timerBlock.style.width = "100%"
    pomoContainer.style.width = "25rem"
  } else {
    tasksBlock.style.display = "flex";
    timerBlock.style.width = "50%";
    pomoContainer.style.width = "40rem"
  }
}

const checkPlayAudio = (status) => {
  if(status === null || status === '') {
    status = true;
    localStorage.setItem('audioStatus', JSON.stringify(status));
  }
  const audioOnIcon = document.querySelector('[data-botao-volumeon]');
  const audioOffIcon = document.querySelector('[data-botao-volumeoff]');

  if(status) {
    audioOnIcon.style.display='flex';
    audioOffIcon.style.display='none';
  } else {
    {
      audioOnIcon.style.display='none';
      audioOffIcon.style.display='flex';
    }
  }
}

export const playAudio = (alarm) => {
  const audioStatus = JSON.parse(localStorage.getItem('audioStatus')) || false; //starting
  console.log(audioStatus);
  alarm.volume = 0.5;

  if(audioStatus) {
    alarm.play();
  }
}