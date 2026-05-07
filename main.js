(function(){
  document.documentElement.classList.add('js-reveal');

  function splitHeading(el){
    var label = el.textContent.replace(/\s+/g, ' ').trim();
    el.setAttribute('aria-label', label);
    var visual = document.createElement('span');
    visual.className = 'char-reveal-visual';
    visual.setAttribute('aria-hidden', 'true');
    var ci = 0;
    function walk(node, parent){
      if (node.nodeType === Node.TEXT_NODE){
        var t = node.textContent;
        var i = 0;
        while (i < t.length){
          if (t[i] === '\n'){
            parent.appendChild(document.createElement('br'));
            i++;
            continue;
          }
          if (/\s/.test(t[i])){
            var sp = document.createElement('span');
            sp.className = 'char-reveal';
            sp.style.setProperty('--ci', String(ci++));
            sp.textContent = '\u00a0';
            parent.appendChild(sp);
            i++;
            continue;
          }
          var wordWrap = document.createElement('span');
          wordWrap.className = 'char-reveal-word';
          while (i < t.length && !/\s/.test(t[i]) && t[i] !== '\n'){
            var s = document.createElement('span');
            s.className = 'char-reveal';
            s.style.setProperty('--ci', String(ci++));
            s.textContent = t[i];
            wordWrap.appendChild(s);
            i++;
          }
          parent.appendChild(wordWrap);
        }
      } else if (node.nodeType === Node.ELEMENT_NODE){
        var tag = node.tagName;
        if (tag === 'BR'){
          parent.appendChild(document.createElement('br'));
          return;
        }
        var wrapper = node.cloneNode(false);
        parent.appendChild(wrapper);
        Array.prototype.slice.call(node.childNodes).forEach(function(c){
          walk(c, wrapper);
        });
      }
    }
    Array.prototype.slice.call(el.childNodes).forEach(function(c){
      walk(c, visual);
    });
    el.textContent = '';
    el.classList.add('char-reveal-root');
    el.appendChild(visual);
    el.style.setProperty('--cc', String(ci));
  }

  function initCharTitles(heads){
    Array.prototype.forEach.call(heads, splitHeading);
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var el = entry.target;
        if (entry.isIntersecting){
          el.classList.remove('char-outview');
          el.classList.add('char-inview');
        } else {
          el.classList.remove('char-inview');
          el.classList.add('char-outview');
        }
      });
    }, {
      /* Require copy to enter the main viewing band — not while still below the fold */
      threshold: 0.08,
      rootMargin: '0px 0px -18% 0px'
    });
    Array.prototype.forEach.call(heads, function(h){
      obs.observe(h);
    });
  }

  function initFadeReveals(nodes){
    if (!nodes.length) return;
    if (!('IntersectionObserver' in window)){
      Array.prototype.forEach.call(nodes, function(el){
        el.classList.add('is-visible');
      });
      return;
    }
    var obs = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, {
      threshold: 0.06,
      rootMargin: '0px 0px -18% 0px'
    });
    Array.prototype.forEach.call(nodes, function(el){
      obs.observe(el);
    });
  }

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var video = document.getElementById('scroll-bg-video');
  if (video){
    if (reduce){
      try{
        video.pause();
        video.currentTime = 0;
      } catch (e){}
    } else {
      video.pause();
      var vTick = false;
      var SCRUB_FPS = 30;
      var frameDur = 1 / SCRUB_FPS;
      var lastFrameIdx = -999999;

      function scrubVideo(){
        vTick = false;
        if (video.readyState < 1) return;
        var d = video.duration;
        if (!d || !isFinite(d)) return;
        var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        var y = window.scrollY || document.documentElement.scrollTop || 0;
        var p = Math.min(1, Math.max(0, y / maxScroll));
        var tMax = Math.max(0, d - frameDur);
        var tRaw = Math.min(p * d, tMax);
        var maxIdx = Math.max(0, Math.floor(tMax / frameDur + 1e-6));
        var idx = Math.min(maxIdx, Math.round(tRaw / frameDur));
        if (idx === lastFrameIdx) return;
        lastFrameIdx = idx;
        var q = idx * frameDur;
        try{
          video.currentTime = q;
        } catch (e){}
      }
      function queueScrub(){
        if (!vTick){
          vTick = true;
          requestAnimationFrame(scrubVideo);
        }
      }
      function onMeta(){
        video.classList.add('is-ready');
        lastFrameIdx = -999999;
        scrubVideo();
      }
      if (video.readyState >= 1) onMeta();
      else video.addEventListener('loadedmetadata', onMeta, { once: true });
      window.addEventListener('scroll', queueScrub, { passive: true });
      window.addEventListener('resize', function(){
        lastFrameIdx = -999999;
        queueScrub();
      }, { passive: true });
    }
  }

  var fadeBlocks = document.querySelectorAll('.reveal-on-scroll');
  var charHeads = document.querySelectorAll('.display-hero, .display-section, .display-cta');

  if (reduce){
    Array.prototype.forEach.call(fadeBlocks, function(el){
      el.classList.add('is-visible');
    });
    return;
  }

  if ('IntersectionObserver' in window){
    initCharTitles(charHeads);
    initFadeReveals(fadeBlocks);
  } else {
    Array.prototype.forEach.call(fadeBlocks, function(el){
      el.classList.add('is-visible');
    });
    Array.prototype.forEach.call(charHeads, splitHeading);
    Array.prototype.forEach.call(document.querySelectorAll('.char-reveal-root'), function(el){
      el.classList.add('char-inview');
    });
  }
})();
