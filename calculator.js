(function(){
  var BOOKING_URL = 'https://cal.com/carlcahill/creative-in-the-loop';

  function goStep(n){
    if (n === 2){
      var tt = document.getElementById('teamType').value;
      if (!tt){ markError('teamType'); return; }
      clearError('teamType');
    }
    if (n === 3){
      var dr = document.getElementById('dayRate').value;
      var oq = document.getElementById('outputQuality').value;
      if (!dr){ markError('dayRate'); return; }
      if (!oq){ markError('outputQuality'); return; }
      clearError('dayRate');
      clearError('outputQuality');
    }

    document.querySelectorAll('#citl-cost-modal .cc-step').forEach(function(s){
      s.classList.remove('is-active');
    });
    document.getElementById('step' + n).classList.add('is-active');

    var bars = { 1: 33, 2: 66, 3: 90 };
    document.getElementById('progressBar').style.width = (bars[n] || 100) + '%';
  }

  function markError(id){
    var el = document.getElementById(id);
    if (el){
      var field = el.closest('.cc-field');
      if (field) field.classList.add('has-error');
    }
  }

  function clearError(id){
    var el = document.getElementById(id);
    if (el){
      var field = el.closest('.cc-field');
      if (field) field.classList.remove('has-error');
    }
  }

  function showResults(){
    var name = document.getElementById('userName').value.trim();
    var email = document.getElementById('userEmail').value.trim();
    var valid = true;

    var nameField = document.getElementById('field-name');
    if (!name){
      nameField.classList.add('has-error');
      valid = false;
    } else {
      nameField.classList.remove('has-error');
    }

    var emailField = document.getElementById('field-email');
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRe.test(email)){
      emailField.classList.add('has-error');
      valid = false;
    } else {
      emailField.classList.remove('has-error');
    }

    if (!valid) return;

    calculateAndShow(name, email);
  }

  function fmt(n){
    return '\u00A3' + Math.round(n).toLocaleString('en-GB');
  }

  function calculateAndShow(name){
    var teamSize = parseInt(document.getElementById('teamSize').value, 10);
    var hoursWasted = parseInt(document.getElementById('hoursWasted').value, 10);
    var dayRate = parseInt(document.getElementById('dayRate').value, 10);
    var quality = document.getElementById('outputQuality').value;
    var teamType = document.getElementById('teamType').value;

    var hourlyRate = dayRate / 7.5;

    var weeklyHoursTotal = hoursWasted * teamSize;
    var weeklyCost = weeklyHoursTotal * hourlyRate;
    var annualRework = weeklyCost * 52;

    var qualityMultipliers = { poor: 1.4, mixed: 1.2, okay: 1.0, good: 0.6 };
    var qMult = qualityMultipliers[quality] || 1.0;
    var outputCost = annualRework * qMult * 0.5;

    var totalAnnualCost = annualRework + outputCost;

    var setupFee = teamSize <= 3 ? 4000 : teamSize <= 8 ? 5000 : 6000;
    var flexiPack = teamSize <= 3 ? 3420 : teamSize <= 8 ? 4860 : 6120;
    var totalInvest = setupFee + flexiPack;
    var saving = totalAnnualCost - totalInvest;

    document.getElementById('annualWaste').textContent = fmt(totalAnnualCost);
    document.getElementById('r-weeklyHours').textContent = weeklyHoursTotal + ' hrs';
    document.getElementById('r-weeklyCost').textContent = fmt(weeklyCost) + ' / wk';
    document.getElementById('r-annualRework').textContent = fmt(annualRework);
    document.getElementById('r-outputCost').textContent = fmt(outputCost);

    document.getElementById('vs-current').textContent = fmt(totalAnnualCost) + ' / yr';
    document.getElementById('vs-setup').textContent = fmt(setupFee) + ' (one-off)';
    document.getElementById('vs-flexi').textContent = fmt(flexiPack) + ' / yr';
    document.getElementById('vs-total').textContent = fmt(totalInvest);
    document.getElementById('vs-saving').textContent = saving > 0 ? fmt(saving) : '\u2014';

    var firstName = name.split(' ')[0];
    document.getElementById('resultSub').textContent =
      'Based on your team of ' + teamSize + ', ' + firstName + '. This is what inconsistency is costing you right now.';

    var rec = '';
    if (saving > 10000){
      rec = 'Based on your numbers, <strong>Creative in the Loop would more than pay for itself in year one</strong>. The gap between what you\'re losing and what the service costs is significant. A short call would tell us quickly whether it\'s the right fit.';
    } else if (saving > 0){
      rec = 'Your numbers suggest <strong>a positive return in year one</strong>, even before accounting for the longer-term value of a properly configured creative engine. Worth a conversation to explore the fit.';
    } else {
      rec = 'Your team is smaller, so the numbers are tighter. But <strong>the qualitative case is still strong</strong> \u2014 consistency, brand quality, and time saved compound over time. Let\'s talk and find out if the timing is right.';
    }

    if (teamType === 'agency'){
      rec += ' For an agency, the real upside is also in what you can offer clients \u2014 a structured AI creative service is a genuine differentiator.';
    }

    document.getElementById('recommendationText').innerHTML = rec;

    document.querySelectorAll('#citl-cost-modal .cc-step').forEach(function(s){
      s.classList.remove('is-active');
    });
    document.getElementById('stepResults').classList.add('is-active');
    document.getElementById('progressBar').style.width = '100%';
  }

  function restart(){
    document.querySelectorAll('#citl-cost-modal .cc-step').forEach(function(s){
      s.classList.remove('is-active');
    });
    document.getElementById('step1').classList.add('is-active');
    document.getElementById('progressBar').style.width = '33%';
    document.getElementById('userName').value = '';
    document.getElementById('userEmail').value = '';
    document.getElementById('userCompany').value = '';
    document.querySelectorAll('#citl-cost-modal .cc-field.has-error').forEach(function(f){
      f.classList.remove('has-error');
    });
  }

  function init(){
    var dlg = document.getElementById('citl-cost-modal');
    if (!dlg) return;

    var teamSize = document.getElementById('teamSize');
    var hoursWasted = document.getElementById('hoursWasted');
    if (teamSize){
      teamSize.addEventListener('input', function(){
        document.getElementById('teamVal').textContent = this.value;
        this.setAttribute('aria-valuenow', this.value);
      });
    }
    if (hoursWasted){
      hoursWasted.addEventListener('input', function(){
        document.getElementById('hoursVal').textContent = this.value;
        this.setAttribute('aria-valuenow', this.value);
      });
    }

    var step1next = document.getElementById('cc-step1-next');
    if (step1next) step1next.addEventListener('click', function(){ goStep(2); });

    var step2back = document.getElementById('cc-step2-back');
    var step2next = document.getElementById('cc-step2-next');
    if (step2back) step2back.addEventListener('click', function(){ goStep(1); });
    if (step2next) step2next.addEventListener('click', function(){ goStep(3); });

    var step3back = document.getElementById('cc-step3-back');
    var step3submit = document.getElementById('cc-step3-submit');
    if (step3back) step3back.addEventListener('click', function(){ goStep(2); });
    if (step3submit) step3submit.addEventListener('click', showResults);

    var resultsBook = document.getElementById('cc-results-book');
    var resultsRestart = document.getElementById('cc-results-restart');
    if (resultsBook){
      resultsBook.addEventListener('click', function(){
        window.open(BOOKING_URL, '_blank', 'noopener,noreferrer');
      });
    }
    if (resultsRestart) resultsRestart.addEventListener('click', restart);

    document.querySelectorAll('[data-open-cost-modal]').forEach(function(btn){
      btn.addEventListener('click', function(){
        dlg.showModal();
        var panel = dlg.querySelector('.citl-calc');
        if (panel) panel.scrollTop = 0;
      });
    });

    var closeBtn = dlg.querySelector('.citl-cost-dialog__close');
    if (closeBtn){
      closeBtn.addEventListener('click', function(){
        dlg.close();
      });
    }

    dlg.addEventListener('close', function(){
      restart();
    });
  }

  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
