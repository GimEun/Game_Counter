const catalog = window.GAME_CATALOG || [];
const games = catalog.flatMap((genre) => genre.games.map((game) => ({ ...game, genre })));
const gameNavigation = document.querySelector('[data-game-navigation]');
const gameSelect = document.querySelector('[data-game-select]');
const reviewPanel = document.querySelector('[data-review-panel]');

function renderNavigation() {
  gameNavigation.innerHTML = catalog.map((genre) => `
    <div class="nav-genre">${genre.index} · ${genre.name}</div>
    ${genre.games.map((game) => `
      <button class="game-nav-button" type="button" data-game-slug="${game.slug}">
        <span class="nav-tier">${game.tier}</span>
        <span>${game.title}</span>
        <small>${game.score}</small>
      </button>`).join('')}
  `).join('');

  gameSelect.innerHTML = catalog.map((genre) => `
    <optgroup label="${genre.name}">
      ${genre.games.map((game) => `<option value="${game.slug}">[${game.tier}] ${game.title}</option>`).join('')}
    </optgroup>`).join('');
}

function createVideo(game) {
  if (!game.video) {
    return `
      <div class="official-fallback">
        <p>공식 YouTube 영상을 확인할 수 없어 출처가 불분명한 재업로드 영상은 넣지 않았습니다.</p>
        <a class="official-link" href="${game.officialUrl}" target="_blank" rel="noopener noreferrer">공식 게임 페이지 보기 <span aria-hidden="true">↗</span></a>
      </div>`;
  }

  return `
    <button class="video-placeholder" type="button" data-video-id="${game.video.id}" data-video-title="${game.video.title}" style="background-image: url('https://i.ytimg.com/vi/${game.video.id}/hqdefault.jpg')" aria-label="${game.video.title} 재생">
      <span class="play-button" aria-hidden="true">▶</span>
    </button>`;
}

function renderGame(game) {
  const index = games.findIndex((item) => item.slug === game.slug);
  const previous = games[(index - 1 + games.length) % games.length];
  const next = games[(index + 1) % games.length];
  const videoSource = game.video ? `${game.video.channel} 공식 채널` : '개발사 공식 페이지';

  reviewPanel.innerHTML = `
    <div class="review-visual" style="--game-image: url('${game.image}'); --art-position: ${game.genre.artPosition}">
      <div class="review-title">
        <p class="review-kicker">${game.genre.name} · ${game.tier} TIER · ${game.year}</p>
        <h3>${game.title}</h3>
        <p>${game.englishTitle} — ${game.developer}</p>
      </div>
    </div>
    <div class="review-body">
      <p class="review-summary">${game.summary}</p>
      <p class="review-overview">${game.overview}</p>
      <dl class="fact-grid">
        <div><dt>수상</dt><dd>${game.awards}</dd></div>
        <div><dt>${game.scoreType}</dt><dd>${game.score}</dd></div>
        <div><dt>플레이</dt><dd>${game.time}</dd></div>
        <div><dt>기준가</dt><dd>${game.price}</dd></div>
        <div><dt>출시</dt><dd>${game.year}</dd></div>
      </dl>
      <div class="review-columns">
        <section class="review-list"><h4>이 게임의 강점</h4><ul>${game.pros.map((item) => `<li>${item}</li>`).join('')}</ul></section>
        <section class="review-list cautions"><h4>플레이 전 유의점</h4><ul>${game.cautions.map((item) => `<li>${item}</li>`).join('')}</ul></section>
      </div>
      <p class="best-for"><strong>이런 플레이어에게</strong>${game.bestFor}</p>
      <p class="platform-line"><strong>플랫폼</strong> · ${game.platforms}</p>
      <section class="video-block" aria-labelledby="video-title-${game.slug}">
        <div class="video-heading"><h4 id="video-title-${game.slug}">공식 영상</h4><p>${videoSource}</p></div>
        ${createVideo(game)}
      </section>
      <div class="review-controls">
        <button type="button" data-move-to="${previous.slug}">← ${previous.title}</button>
        <button type="button" data-move-to="${next.slug}">${next.title} →</button>
      </div>
    </div>`;

  gameNavigation.querySelectorAll('[data-game-slug]').forEach((button) => {
    const isActive = button.dataset.gameSlug === game.slug;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
    if (isActive) gameNavigation.scrollTop = Math.max(0, button.offsetTop - gameNavigation.clientHeight / 2);
  });
  gameSelect.value = game.slug;
}

function selectGame(slug, updateHash = true) {
  const game = games.find((item) => item.slug === slug) || games[0];
  if (!game) {
    reviewPanel.innerHTML = '<p class="noscript-message">게임 데이터를 불러오지 못했습니다.</p>';
    return;
  }

  renderGame(game);
  if (updateHash) history.replaceState(null, '', `#${game.slug}`);
}

gameNavigation.addEventListener('click', (event) => {
  const button = event.target.closest('[data-game-slug]');
  if (button) selectGame(button.dataset.gameSlug);
});

gameSelect.addEventListener('change', () => selectGame(gameSelect.value));

reviewPanel.addEventListener('click', (event) => {
  const moveButton = event.target.closest('[data-move-to]');
  if (moveButton) {
    selectGame(moveButton.dataset.moveTo);
    document.querySelector('#game-explorer').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const videoButton = event.target.closest('[data-video-id]');
  if (!videoButton) return;
  const iframe = document.createElement('iframe');
  iframe.className = 'video-frame';
  iframe.src = `https://www.youtube-nocookie.com/embed/${videoButton.dataset.videoId}?autoplay=1&rel=0`;
  iframe.title = videoButton.dataset.videoTitle;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
  iframe.referrerPolicy = 'strict-origin-when-cross-origin';
  iframe.allowFullscreen = true;
  videoButton.replaceWith(iframe);
});

window.addEventListener('hashchange', () => selectGame(window.location.hash.slice(1), false));

renderNavigation();
selectGame(window.location.hash.slice(1), false);
