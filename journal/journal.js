const searchInput = document.querySelector('[data-journal-search]');
const clearButton = document.querySelector('[data-search-clear]');
const cards = [...document.querySelectorAll('[data-article-card]')];
const filters = [...document.querySelectorAll('[data-topic-filter]')];
const count = document.querySelector('[data-results-count]');
const empty = document.querySelector('[data-empty-state]');

let selectedTopic = 'all';

function normalize(value) {
  return value.toLocaleLowerCase('ru-RU').replaceAll('ё', 'е').trim();
}

function updateResults() {
  const query = normalize(searchInput?.value || '');
  let visible = 0;

  cards.forEach((card) => {
    const topics = (card.dataset.topics || '').split(' ');
    const haystack = normalize(card.textContent || '');
    const topicMatches = selectedTopic === 'all' || topics.includes(selectedTopic);
    const searchMatches = !query || haystack.includes(query);
    const isVisible = topicMatches && searchMatches;
    card.hidden = !isVisible;
    if (isVisible) visible += 1;
  });

  if (count) count.textContent = `${visible} ${visible === 1 ? 'материал' : visible > 1 && visible < 5 ? 'материала' : 'материалов'}`;
  if (empty) empty.hidden = visible !== 0;
  if (clearButton) clearButton.dataset.visible = String(Boolean(query));
}

filters.forEach((filter) => {
  filter.addEventListener('click', () => {
    selectedTopic = filter.dataset.topicFilter || 'all';
    filters.forEach((item) => item.setAttribute('aria-pressed', String(item === filter)));
    updateResults();
  });
});

searchInput?.addEventListener('input', updateResults);
clearButton?.addEventListener('click', () => {
  searchInput.value = '';
  searchInput.focus();
  updateResults();
});

updateResults();
