(function () {
    'use strict';

    var gallery = document.getElementById('galeria');
    if (!gallery) return;
    var grid = gallery.querySelector('.ad-gallery-grid');
    if (!grid) return;
    var items = Array.from(grid.querySelectorAll('.ad-gallery-item'));
    var filters = Array.from(gallery.querySelectorAll('[data-gallery-filter]'));
    var filterBar = gallery.querySelector('.ad-gallery-filters');
    var more = document.getElementById('ad-gallery-more');
    var count = document.getElementById('ad-gallery-count');
    var pageSize = 9;
    var limit = pageSize;
    var active = 'all';
    var matching = items.slice();
    var dialog = document.getElementById('ad-gallery-viewer');
    var full = document.getElementById('ad-gallery-full');
    var caption = document.getElementById('ad-gallery-caption');
    var position = document.getElementById('ad-gallery-position');
    var original = document.getElementById('ad-gallery-original');
    var loading = document.getElementById('ad-gallery-loading');
    var previous = document.getElementById('ad-gallery-prev');
    var next = document.getElementById('ad-gallery-next');
    var currentIndex = 0;
    var opener = null;
    var loadVersion = 0;
    var ignoreBackdropUntil = 0;

    function applyFilter() {
        matching = items.filter(function (item) { return active === 'all' || item.dataset.category === active; });
        var visible = new Set(matching.slice(0, limit));
        items.forEach(function (item) { item.hidden = !visible.has(item); });
        filters.forEach(function (button) { button.setAttribute('aria-pressed', String(button.dataset.galleryFilter === active)); });
        count.textContent = 'Exibindo ' + visible.size + ' de ' + matching.length + ' fotos';
        more.hidden = limit >= matching.length;
        more.textContent = 'Ver mais fotos (' + Math.min(pageSize, matching.length - limit) + ')';
    }

    filters.forEach(function (button) {
        button.addEventListener('click', function () {
            if (active === button.dataset.galleryFilter) return;
            active = button.dataset.galleryFilter;
            limit = pageSize;
            applyFilter();
        });
    });

    more.addEventListener('click', function () {
        var firstNew = limit;
        limit += pageSize;
        applyFilter();
        var link = matching[firstNew] && matching[firstNew].querySelector('.ad-gallery-open');
        if (link) link.focus({preventScroll: true});
    });

    filterBar.hidden = false;
    count.hidden = false;
    applyFilter();

    // Sem suporte a dialog, os links ainda abrem os arquivos originais.
    if (!dialog || typeof dialog.showModal !== 'function') return;

    function showPhoto(index) {
        currentIndex = (index + matching.length) % matching.length;
        var item = matching[currentIndex];
        var link = item.querySelector('.ad-gallery-open');
        var thumb = link.querySelector('img');
        var title = item.querySelector('.ad-gallery-caption').textContent;
        var version = ++loadVersion;
        full.hidden = true;
        full.removeAttribute('src');
        full.alt = thumb.alt;
        caption.textContent = title;
        position.textContent = (currentIndex + 1) + ' de ' + matching.length;
        original.href = link.href;
        loading.textContent = 'Carregando foto…';
        loading.hidden = false;
        previous.hidden = next.hidden = matching.length < 2;
        dialog.setAttribute('aria-busy', 'true');

        // Uma requisição antiga não pode sobrescrever a foto selecionada.
        var image = new Image();
        image.onload = function () {
            if (version !== loadVersion || !dialog.open) return;
            full.src = link.href;
            full.hidden = false;
            loading.hidden = true;
            dialog.removeAttribute('aria-busy');
        };
        image.onerror = function () {
            if (version !== loadVersion || !dialog.open) return;
            loading.textContent = 'Não foi possível carregar esta foto. Tente a próxima imagem ou abra o arquivo original.';
            dialog.removeAttribute('aria-busy');
        };
        image.src = link.href;
    }

    grid.addEventListener('click', function (event) {
        var link = event.target.closest('.ad-gallery-open');
        if (!link || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        var item = link.closest('.ad-gallery-item');
        var index = matching.indexOf(item);
        if (index < 0) return;
        event.preventDefault();
        opener = link;
        dialog.showModal();
        document.documentElement.classList.add('ad-gallery-scroll-lock');
        showPhoto(index);
    });

    document.getElementById('ad-gallery-close').addEventListener('click', function () { dialog.close(); });
    previous.addEventListener('click', function () { showPhoto(currentIndex - 1); });
    next.addEventListener('click', function () { showPhoto(currentIndex + 1); });
    dialog.addEventListener('click', function (event) {
        if (Date.now() < ignoreBackdropUntil) return;
        if (event.target === dialog || event.target.classList.contains('ad-gallery-image-area')) dialog.close();
    });
    dialog.addEventListener('keydown', function (event) {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
            event.preventDefault();
            showPhoto(currentIndex + (event.key === 'ArrowLeft' ? -1 : 1));
        }
    });
    dialog.addEventListener('close', function () {
        ++loadVersion;
        document.documentElement.classList.remove('ad-gallery-scroll-lock');
        full.hidden = true;
        full.removeAttribute('src');
        dialog.removeAttribute('aria-busy');
        if (opener && opener.isConnected) opener.focus({preventScroll: true});
    });

    var touchStart = null;
    var imageArea = dialog.querySelector('.ad-gallery-image-area');
    imageArea.addEventListener('pointerdown', function (event) {
        touchStart = event.pointerType === 'touch' && event.isPrimary ? {x: event.clientX, y: event.clientY, id: event.pointerId} : null;
    });
    imageArea.addEventListener('pointercancel', function () { touchStart = null; });
    imageArea.addEventListener('pointerup', function (event) {
        if (!touchStart || event.pointerId !== touchStart.id) return;
        var dx = event.clientX - touchStart.x;
        var dy = event.clientY - touchStart.y;
        touchStart = null;
        if (Math.abs(dx) > 60 && Math.abs(dy) < 60) {
            ignoreBackdropUntil = Date.now() + 350;
            showPhoto(currentIndex + (dx < 0 ? 1 : -1));
        }
    });
})();
