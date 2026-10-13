/**
 * MBTI 테스트 애플리케이션 로직
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM 요소 참조
  const startScreen = document.getElementById('screen-start');
  const questionScreen = document.getElementById('screen-question');
  const loadingScreen = document.getElementById('screen-loading');
  const resultScreen = document.getElementById('screen-result');

  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnShare = document.getElementById('btn-share');
  const btnPrev = document.getElementById('btn-prev');

  const progressFill = document.getElementById('progress-fill');
  const progressMascot = document.getElementById('progress-mascot');
  const currentQNum = document.getElementById('current-q-num');
  const totalQNum = document.getElementById('total-q-num');
  const questionTitle = document.getElementById('question-title');
  const questionCard = document.getElementById('question-card');

  const btnChoiceA = document.getElementById('choice-a');
  const btnChoiceB = document.getElementById('choice-b');
  const choiceTextA = document.getElementById('choice-text-a');
  const choiceTextB = document.getElementById('choice-text-b');
  const choiceEmojiA = document.getElementById('choice-emoji-a');
  const choiceEmojiB = document.getElementById('choice-emoji-b');

  const toast = document.getElementById('toast');

  // 상태 변수
  let currentStep = 0;
  const answersHistory = []; // { index, type, choice }
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  const confetti = new window.ConfettiEffect('confetti-canvas');
  totalQNum.textContent = MBTI_QUESTIONS.length;

  // 화면 전환 유틸
  function switchScreen(fromScreen, toScreen, animation = 'fade') {
    fromScreen.classList.remove('active');
    toScreen.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // 토스트 메시지
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }

  // 테스트 시작
  btnStart.addEventListener('click', () => {
    resetState();
    switchScreen(startScreen, questionScreen);
    renderQuestion(0);
  });

  // 상태 초기화
  function resetState() {
    currentStep = 0;
    answersHistory.length = 0;
    Object.keys(scores).forEach(key => scores[key] = 0);
  }

  // 질문 렌더링
  function renderQuestion(index, direction = 'next') {
    const q = MBTI_QUESTIONS[index];
    currentQNum.textContent = index + 1;

    // 프로그레스 바 계산
    const progressPercent = ((index) / (MBTI_QUESTIONS.length)) * 100;
    progressFill.style.width = `${progressPercent}%`;
    if (progressMascot) {
      progressMascot.style.left = `calc(${progressPercent}% - 14px)`;
    }

    // 이전 버튼 활성/비활성
    if (index > 0) {
      btnPrev.classList.remove('hidden');
    } else {
      btnPrev.classList.add('hidden');
    }

    // 애니메이션 초기화 후 텍스트 세팅
    questionCard.classList.remove('slide-in-next', 'slide-in-prev');
    void questionCard.offsetWidth; // trigger reflow
    questionCard.classList.add(direction === 'next' ? 'slide-in-next' : 'slide-in-prev');

    questionTitle.textContent = q.question;
    choiceTextA.textContent = q.choiceA.text;
    choiceEmojiA.textContent = q.choiceA.emoji;
    choiceTextB.textContent = q.choiceB.text;
    choiceEmojiB.textContent = q.choiceB.emoji;

    // 버튼 선택 상태 리셋
    btnChoiceA.classList.remove('selected');
    btnChoiceB.classList.remove('selected');
    btnChoiceA.disabled = false;
    btnChoiceB.disabled = false;
  }

  // 선택지 클릭 이벤트 핸들러
  function handleChoice(choiceKey) {
    const q = MBTI_QUESTIONS[currentStep];
    const selectedOption = choiceKey === 'A' ? q.choiceA : q.choiceB;
    const selectedBtn = choiceKey === 'A' ? btnChoiceA : btnChoiceB;

    // 클릭 피드백
    selectedBtn.classList.add('selected');
    btnChoiceA.disabled = true;
    btnChoiceB.disabled = true;

    // 점수 가산
    scores[selectedOption.type]++;
    answersHistory.push({
      step: currentStep,
      choice: choiceKey,
      type: selectedOption.type
    });

    // 다음 질문으로 이동
    setTimeout(() => {
      if (currentStep < MBTI_QUESTIONS.length - 1) {
        currentStep++;
        renderQuestion(currentStep, 'next');
      } else {
        // 모든 질문 답변 완료 -> 로딩 화면 거쳐 결과 표시
        showLoadingAndResult();
      }
    }, 280);
  }

  btnChoiceA.addEventListener('click', () => handleChoice('A'));
  btnChoiceB.addEventListener('click', () => handleChoice('B'));

  // 이전 질문으로 가기
  btnPrev.addEventListener('click', () => {
    if (currentStep > 0 && answersHistory.length > 0) {
      const lastAnswer = answersHistory.pop();
      scores[lastAnswer.type]--;
      currentStep--;
      renderQuestion(currentStep, 'prev');
    }
  });

  // 로딩 화면 후 결과 화면 전환
  function showLoadingAndResult() {
    progressFill.style.width = '100%';
    if (progressMascot) {
      progressMascot.style.left = 'calc(100% - 24px)';
    }

    switchScreen(questionScreen, loadingScreen);

    // 흥미로운 분석 멘트 회전
    const loadingTexts = [
      '나의 선택들을 종합하고 있어요... 🧩',
      '성격 유형 데이터를 세밀하게 분석 중... 🔮',
      '나와 가장 어울리는 캐릭터를 찾는 중... 💖',
      '분석 완료! 결과를 공개합니다! ✨'
    ];
    const loadingSub = document.getElementById('loading-subtext');
    let textIdx = 0;
    const interval = setInterval(() => {
      textIdx = (textIdx + 1) % loadingTexts.length;
      if (loadingSub) loadingSub.textContent = loadingTexts[textIdx];
    }, 380);

    setTimeout(() => {
      clearInterval(interval);
      calculateAndRenderResult();
      switchScreen(loadingScreen, resultScreen);
      confetti.start(140);
    }, 1400);
  }

  // 결과 계산 및 렌더링
  function calculateAndRenderResult() {
    const eScore = scores.E || 0;
    const iScore = scores.I || 0;
    const sScore = scores.S || 0;
    const nScore = scores.N || 0;
    const tScore = scores.T || 0;
    const fScore = scores.F || 0;
    const jScore = scores.J || 0;
    const pScore = scores.P || 0;

    const mbti = [
      eScore >= iScore ? 'E' : 'I',
      sScore >= nScore ? 'S' : 'N',
      tScore >= fScore ? 'T' : 'F',
      jScore >= pScore ? 'J' : 'P'
    ].join('');

    const resultData = MBTI_RESULTS[mbti] || MBTI_RESULTS.ENFP;

    // 결과 화면 바인딩
    document.getElementById('result-badge-type').textContent = resultData.type;
    document.getElementById('result-badge-type').style.background = resultData.badgeColor;
    document.getElementById('result-emoji').textContent = resultData.emoji;
    document.getElementById('result-title').textContent = resultData.title;
    document.getElementById('result-nickname').textContent = resultData.nickname;
    document.getElementById('result-summary').textContent = resultData.summary;

    // 해시태그 렌더링
    const tagsContainer = document.getElementById('result-tags');
    tagsContainer.innerHTML = '';
    resultData.tags.forEach(tag => {
      const span = document.createElement('span');
      span.className = 'tag-chip';
      span.textContent = tag;
      tagsContainer.appendChild(span);
    });

    // 특징 리스트 렌더링
    const traitsList = document.getElementById('result-traits-list');
    traitsList.innerHTML = '';
    resultData.traits.forEach(trait => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="trait-bullet">✨</span><span>${trait}</span>`;
      traitsList.appendChild(li);
    });

    // 성향 비율 게이지 바
    renderDimensionBar('bar-ei', 'label-ei', '외향 (E)', '내향 (I)', eScore, iScore);
    renderDimensionBar('bar-sn', 'label-sn', '감각 (S)', '직관 (N)', sScore, nScore);
    renderDimensionBar('bar-tf', 'label-tf', '사고 (T)', '감정 (F)', tScore, fScore);
    renderDimensionBar('bar-jp', 'label-jp', '판단 (J)', '인식 (P)', jScore, pScore);

    // 케미 궁합 바인딩
    const bestBox = document.getElementById('chem-best');
    const worstBox = document.getElementById('chem-worst');

    bestBox.innerHTML = `
      <div class="chem-badge best">환상의 짝꿍 💕</div>
      <div class="chem-type">${resultData.bestChemistry.type}</div>
      <div class="chem-name">${resultData.bestChemistry.name}</div>
      <div class="chem-reason">${resultData.bestChemistry.reason}</div>
    `;

    worstBox.innerHTML = `
      <div class="chem-badge worst">주의할 짝꿍 ⚡</div>
      <div class="chem-type">${resultData.worstChemistry.type}</div>
      <div class="chem-name">${resultData.worstChemistry.name}</div>
      <div class="chem-reason">${resultData.worstChemistry.reason}</div>
    `;
  }

  function renderDimensionBar(barId, labelId, leftName, rightName, leftScore, rightScore) {
    const total = (leftScore + rightScore) || 1;
    const leftPct = Math.round((leftScore / total) * 100);
    const rightPct = 100 - leftPct;

    const barEl = document.getElementById(barId);
    const labelEl = document.getElementById(labelId);

    if (barEl) {
      barEl.style.width = `${leftPct}%`;
    }
    if (labelEl) {
      labelEl.innerHTML = `<span>${leftName} <strong>${leftPct}%</strong></span><span><strong>${rightPct}%</strong> ${rightName}</span>`;
    }
  }

  // 다시 테스트하기
  btnRestart.addEventListener('click', () => {
    confetti.stop();
    resetState();
    switchScreen(resultScreen, startScreen);
  });

  // 공유하기 (클립보드 복사)
  btnShare.addEventListener('click', () => {
    const url = window.location.href;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => showToast('✨ 테스트 링크가 클립보드에 복사되었어요!'))
        .catch(() => fallbackCopy(url));
    } else {
      fallbackCopy(url);
    }
  });

  function fallbackCopy(text) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    try {
      document.execCommand('copy');
      showToast('✨ 테스트 링크가 복사되었어요!');
    } catch (err) {
      showToast('🔗 URL을 직접 복사해주세요: ' + window.location.href);
    }
    document.body.removeChild(input);
  }
});
