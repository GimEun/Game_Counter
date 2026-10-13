const genreData = window.GAME_CATALOG || [];

const tierLabels = { S: 'MASTERPIECE', A: 'ESSENTIAL', B: 'RECOMMENDED' };
const sectionsContainer = document.querySelector('[data-tier-sections]');
const filterContainer = document.querySelector('[data-genre-filter]');
const filterStatus = document.querySelector('[data-filter-status]');

function createGameCard(game, artPosition) {
  const scoreClass = game.scoreType === 'STEAM' ? ' steam' : '';
  return `
    <article class="game-card">
      <div class="game-cover" data-game-image="${game.image}" style="--art-position: ${artPosition}" aria-hidden="true"></div>
      <div class="game-info">
        <div class="game-title-row">
          <h4>${game.title}</h4>
          <span class="score-chip${scoreClass}">${game.scoreType} ${game.score}</span>
        </div>
        <p class="game-summary">${game.summary}</p>
        <dl class="game-facts">
          <div><dt>수상</dt><dd>${game.awards}</dd></div>
          <div><dt>플레이</dt><dd>${game.time}</dd></div>
          <div><dt>기준가</dt><dd>${game.price}</dd></div>
        </dl>
        <p class="platforms" title="${game.platforms}">${game.platforms}</p>
        <a class="detail-link" href="./criteria-and-detail.html#${game.slug}">상세 리뷰 보기 <span aria-hidden="true">→</span></a>
      </div>
    </article>`;
}

function createGenreSection(genre) {
  const lanes = ['S', 'A', 'B'].map((tier) => {
    const cards = genre.games.filter((game) => game.tier === tier)
      .map((game) => createGameCard(game, genre.artPosition)).join('');

    return `
      <div class="tier-lane" data-tier="${tier}">
        <div class="lane-label"><strong>${tier}</strong><small>${tierLabels[tier]}</small></div>
        <div class="lane-games">${cards}</div>
      </div>`;
  }).join('');

  return `
    <section class="genre-section" id="${genre.id}" data-genre-section="${genre.id}" aria-labelledby="${genre.id}-title">
      <div class="genre-intro">
        <span class="genre-index">${genre.index}</span>
        <h3 id="${genre.id}-title">${genre.name}</h3>
        <p>${genre.description}</p>
      </div>
      <div class="tier-lanes">${lanes}</div>
    </section>`;
}

function selectGenre(genreId, updateHistory = true) {
  const validGenre = genreData.some((genre) => genre.id === genreId) ? genreId : 'all';
  const activeGenre = genreData.find((genre) => genre.id === validGenre);

  document.querySelectorAll('[data-genre-section]').forEach((section) => {
    section.hidden = validGenre !== 'all' && section.dataset.genreSection !== validGenre;
  });

  filterContainer.querySelectorAll('button').forEach((button) => {
    const isActive = button.dataset.genre === validGenre;
    button.classList.toggle('active', isActive);
    button.setAttribute('aria-pressed', String(isActive));
  });

  filterStatus.textContent = validGenre === 'all'
    ? '전체 20개 게임을 표시합니다.'
    : `${activeGenre.name} 추천작 ${activeGenre.games.length}개를 표시합니다.`;

  if (updateHistory) {
    const nextUrl = validGenre === 'all'
      ? `${window.location.pathname}${window.location.search}`
      : `#${validGenre}`;
    history.replaceState(null, '', nextUrl);
  }
}

if (genreData.length) {
  sectionsContainer.innerHTML = genreData.map(createGenreSection).join('');

  const covers = sectionsContainer.querySelectorAll('[data-game-image]');
  const loadCover = (cover) => cover.style.setProperty('--game-image', `url('${cover.dataset.gameImage}')`);
  if ('IntersectionObserver' in window) {
    const coverObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadCover(entry.target);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '280px 0px' });
    covers.forEach((cover) => coverObserver.observe(cover));
  } else {
    covers.forEach(loadCover);
  }

  filterContainer.addEventListener('click', (event) => {
    const button = event.target.closest('button[data-genre]');
    if (button) selectGenre(button.dataset.genre);
  });
  selectGenre(window.location.hash.slice(1), false);
} else {
  filterStatus.textContent = '게임 데이터를 불러오지 못했습니다.';
}
