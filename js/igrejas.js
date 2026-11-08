(function (root) {
    'use strict';

    function normalizar(value) {
        return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
            .toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
    }

    function temCoordenadas(igreja) {
        var c = igreja.coordenadas;
        return !!c && Number.isFinite(c.latitude) && Number.isFinite(c.longitude)
            && c.latitude >= -90 && c.latitude <= 90 && c.longitude >= -180 && c.longitude <= 180;
    }

    function distancia(origem, destino) {
        var radians = Math.PI / 180;
        var lat = (destino.latitude - origem.latitude) * radians;
        var lon = (destino.longitude - origem.longitude) * radians;
        var a = Math.sin(lat / 2) ** 2 + Math.cos(origem.latitude * radians)
            * Math.cos(destino.latitude * radians) * Math.sin(lon / 2) ** 2;
        return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(Math.max(0, 1 - a)));
    }

    function filtrar(igrejas, filtros) {
        var terms = normalizar(filtros.busca).split(' ').filter(Boolean);
        var digits = String(filtros.busca || '').replace(/\D/g, '');
        var postalOnly = digits.length > 0 && !/[a-z]/.test(normalizar(filtros.busca));
        return igrejas.filter(function (igreja) {
            if (filtros.cidade && igreja.cidade !== filtros.cidade) return false;
            if (filtros.regional && igreja.regional !== filtros.regional) return false;
            if (postalOnly) return String(igreja.cep || '').replace(/\D/g, '').includes(digits)
                || normalizar(igreja.nome + ' ' + igreja.endereco).includes(normalizar(filtros.busca));
            var haystack = normalizar([igreja.nome, igreja.cidade, igreja.uf, igreja.regional,
                igreja.campo, igreja.endereco, igreja.cep, igreja.responsavel && igreja.responsavel.nome].join(' '));
            return terms.every(function (term) { return haystack.includes(term); });
        });
    }

    function ordenar(igrejas, origem) {
        return igrejas.slice().sort(function (a, b) {
            if (origem) {
                var da = temCoordenadas(a) ? distancia(origem, a.coordenadas) : Infinity;
                var db = temCoordenadas(b) ? distancia(origem, b.coordenadas) : Infinity;
                if (da !== db) return da - db;
            }
            if (a.id === 'sao-paulo-matriz-lapa') return -1;
            if (b.id === 'sao-paulo-matriz-lapa') return 1;
            return (a.cidade || a.regional).localeCompare(b.cidade || b.regional, 'pt-BR')
                || a.nome.localeCompare(b.nome, 'pt-BR');
        });
    }

    function destinoMapa(igreja) {
        return [igreja.endereco, igreja.cidade, igreja.uf, 'Brasil'].filter(Boolean).join(', ');
    }

    function linksMapas(igreja) {
        var endereco = encodeURIComponent(destinoMapa(igreja));
        return {
            google: 'https://www.google.com/maps/dir/?api=1&destination=' + endereco,
            waze: 'https://www.waze.com/ul?q=' + endereco + '&navigate=yes&utm_source=adpaulistana'
        };
    }

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = { normalizar: normalizar, filtrar: filtrar, ordenar: ordenar,
            distancia: distancia, temCoordenadas: temCoordenadas, linksMapas: linksMapas };
    }
    if (!root.document) return;

    var document = root.document;
    var cadastro = root.ADPAULISTANA_IGREJAS;
    var pastores = root.ADPASTORES || [];
    var form = document.getElementById('igrejas-filtros');
    var busca = document.getElementById('igrejas-busca');
    var cidade = document.getElementById('igrejas-cidade');
    var regional = document.getElementById('igrejas-regional');
    var resultados = document.getElementById('igrejas-resultados');
    var mais = document.getElementById('igrejas-mais');
    var localizar = document.getElementById('igrejas-localizacao');
    var status = document.getElementById('igrejas-localizacao-status');
    var cobertura = document.getElementById('igrejas-cobertura');
    var origem = null;
    var limite = 12;
    var requestId = 0;
    var lista = [];

    function element(tag, className, text) {
        var node = document.createElement(tag);
        if (className) node.className = className;
        if (text) node.textContent = text;
        return node;
    }

    function externalLink(href, text, label, className) {
        var a = element('a', className, text);
        a.href = href;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.setAttribute('aria-label', label + ' (abre em nova aba)');
        return a;
    }

    function aviso(text, error) {
        status.textContent = text;
        status.hidden = !text;
        if (error) status.setAttribute('data-error', '');
        else status.removeAttribute('data-error');
    }

    function card(igreja) {
        var article = element('article', 'church-card');
        var content = element('div', 'church-card-main');
        content.appendChild(element('p', 'church-card-region', igreja.regional));
        content.appendChild(element('h3', '', igreja.nome));
        content.appendChild(element('address', '', igreja.endereco));
        content.appendChild(element('p', 'church-card-city', (igreja.cidade || 'Cidade a confirmar') + ' · ' + igreja.uf));
        if (igreja.cep) content.appendChild(element('p', 'church-card-cep', 'CEP ' + igreja.cep));
        if (igreja.pendencias && igreja.pendencias.length) content.appendChild(element('p', 'church-review', 'Confirme os detalhes do endereço antes de sua visita.'));

        if (origem && temCoordenadas(igreja)) {
            var km = distancia(origem, igreja.coordenadas);
            var value = km < 1 ? Math.max(10, Math.round(km * 100) * 10).toLocaleString('pt-BR') + ' m'
                : km.toLocaleString('pt-BR', {maximumFractionDigits: 1}) + ' km';
            content.appendChild(element('p', 'church-distance', 'Aprox. ' + value + ' de você'));
            content.appendChild(element('span', 'church-distance-note', igreja.coordenadas.precisao === 'numero'
                ? 'Distância em linha reta.' : 'Referência aproximada da rua; confirme o número no mapa.'));
        } else if (origem) {
            content.appendChild(element('p', 'church-distance-note', 'Distância ainda indisponível para este endereço.'));
        }

        var person = element('div', 'church-pastor');
        var responsavel = igreja.responsavel;
        if (responsavel) {
            var pastor = pastores.find(function (p) { return p.id === responsavel.pastorId; });
            if (pastor) {
                var photo = element('img');
                photo.src = pastor.foto;
                photo.alt = responsavel.nome;
                photo.width = 52;
                photo.height = 66;
                photo.loading = 'lazy';
                person.appendChild(photo);
            }
            var details = element('div');
            details.appendChild(element('p', 'church-pastor-label', responsavel.cargo));
            var name = element('p', 'church-pastor-name');
            if (pastor) name.appendChild(externalLink('biografia.html?pastor=' + encodeURIComponent(pastor.id), responsavel.nome, 'Biografia de ' + responsavel.nome));
            else name.textContent = responsavel.nome;
            details.appendChild(name);
            person.appendChild(details);
        } else {
            person.appendChild(element('p', 'church-pastor-label', 'Responsável local a informar.'));
        }
        content.appendChild(person);

        var contact = element('p', 'church-contact');
        var hasContact = false;
        var contato = igreja.contato || {};
        if (contato.telefone) {
            var phone = element('a', '', contato.telefone);
            phone.href = 'tel:+' + (contato.telefone.startsWith('+') ? '' : '55') + contato.telefone.replace(/\D/g, '');
            contact.appendChild(phone);
            hasContact = true;
        }
        if (contato.whatsapp) {
            contact.appendChild(externalLink('https://wa.me/' + contato.whatsapp.replace(/\D/g, ''), 'WhatsApp', 'WhatsApp da congregação ' + igreja.nome));
            hasContact = true;
        }
        if (contato.email) {
            var email = element('a', '', 'E-mail');
            email.href = 'mailto:' + contato.email;
            contact.appendChild(email);
            hasContact = true;
        }
        if (!hasContact) contact.textContent = 'Contato local ainda não informado.';
        content.appendChild(contact);
        article.appendChild(content);
        var actions = element('div', 'church-card-actions');
        var maps = linksMapas(igreja);
        actions.appendChild(externalLink(maps.google, 'Google Maps ↗', 'Como chegar à congregação ' + igreja.nome + ' no Google Maps', 'button button-primary'));
        actions.appendChild(externalLink(maps.waze, 'Waze ↗', 'Abrir congregação ' + igreja.nome + ' no Waze', 'button button-secondary'));
        article.appendChild(actions);
        return article;
    }

    function syncURL() {
        var url = new URL(root.location.href);
        [['q', busca.value.trim()], ['cidade', cidade.value], ['regional', regional.value]].forEach(function (pair) {
            if (pair[1]) url.searchParams.set(pair[0], pair[1]);
            else url.searchParams.delete(pair[0]);
        });
        root.history.replaceState(null, '', url);
    }

    function render(reset) {
        if (reset) limite = 12;
        lista = ordenar(filtrar(cadastro.igrejas, {busca: busca.value, cidade: cidade.value, regional: regional.value}), origem);
        var fragment = document.createDocumentFragment();
        lista.slice(0, limite).forEach(function (igreja) { fragment.appendChild(card(igreja)); });
        resultados.replaceChildren(fragment);
        document.getElementById('igrejas-contagem').textContent = lista.length + (lista.length === 1 ? ' congregação encontrada' : ' congregações encontradas');
        document.getElementById('igrejas-vazio').hidden = lista.length !== 0;
        mais.hidden = lista.length <= limite;
        if (!mais.hidden) mais.textContent = 'Ver mais congregações (' + Math.min(limite, lista.length) + ' de ' + lista.length + ')';
        cobertura.hidden = !origem;
        if (origem) {
            var mapped = lista.filter(temCoordenadas).length;
            cobertura.textContent = mapped + ' de ' + lista.length + ' congregações deste filtro têm coordenadas. '
                + 'Ordenação por distância aproximada em linha reta; endereços sem coordenadas aparecem ao final. O percurso real pode variar.';
        }
        syncURL();
    }

    function fillSelect(select, values, label) {
        var selected = select.value;
        select.replaceChildren(new Option(label, ''));
        Array.from(new Set(values.filter(Boolean))).sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); })
            .forEach(function (value) { select.appendChild(new Option(value, value)); });
        select.value = values.includes(selected) ? selected : '';
    }

    function fillCities() {
        fillSelect(cidade, cadastro.igrejas.filter(function (igreja) {
            return !regional.value || igreja.regional === regional.value;
        }).map(function (igreja) { return igreja.cidade; }), 'Todas as cidades');
    }

    function clearFilters() {
        requestId += 1;
        busca.value = '';
        regional.value = '';
        cidade.value = '';
        origem = null;
        localizar.disabled = false;
        localizar.textContent = 'Usar minha localização';
        aviso('');
        fillCities();
        render(true);
    }

    if (!cadastro || !Array.isArray(cadastro.igrejas) || !cadastro.igrejas.length) {
        aviso('Não foi possível carregar o cadastro. Recarregue a página ou entre em contato com a sede.', true);
        form.hidden = true;
        return;
    }

    var params = new URLSearchParams(root.location.search);
    fillSelect(regional, cadastro.igrejas.map(function (igreja) { return igreja.regional; }), 'Todas as regiões');
    if (Array.from(regional.options).some(function (o) { return o.value === params.get('regional'); })) regional.value = params.get('regional');
    fillCities();
    if (Array.from(cidade.options).some(function (o) { return o.value === params.get('cidade'); })) cidade.value = params.get('cidade');
    busca.value = params.get('q') || '';
    busca.addEventListener('input', function () { render(true); });
    regional.addEventListener('change', function () { fillCities(); render(true); });
    cidade.addEventListener('change', function () { render(true); });
    form.addEventListener('submit', function (event) { event.preventDefault(); render(true); });
    form.addEventListener('reset', function (event) { event.preventDefault(); clearFilters(); });
    document.getElementById('igrejas-limpar-vazio').addEventListener('click', function () { clearFilters(); busca.focus(); });
    mais.addEventListener('click', function () {
        var firstNew = limite;
        limite += 12;
        render(false);
        var heading = resultados.children[firstNew] && resultados.children[firstNew].querySelector('h3');
        if (heading) { heading.tabIndex = -1; heading.focus(); }
    });

    localizar.addEventListener('click', function () {
        if (root.isSecureContext === false) { aviso('Abra o site por HTTPS para usar sua localização.', true); return; }
        if (!root.navigator.geolocation) { aviso('Este navegador não oferece localização. Você pode pesquisar por cidade, bairro ou CEP.', true); return; }
        var current = ++requestId;
        localizar.disabled = true;
        localizar.textContent = 'Obtendo localização…';
        aviso('Aguardando sua localização. Se solicitado, permita o acesso no navegador.');
        root.navigator.geolocation.getCurrentPosition(function (position) {
            if (current !== requestId) return;
            localizar.disabled = false;
            localizar.textContent = 'Atualizar localização';
            var coordinates = {latitude: position.coords.latitude, longitude: position.coords.longitude};
            if (!temCoordenadas({coordenadas: coordinates})) { aviso('O navegador não retornou uma localização válida. Tente novamente.', true); return; }
            origem = coordinates;
            aviso('Localização obtida. As congregações com coordenadas aparecem primeiro, em ordem de proximidade.'
                + (position.coords.accuracy > 3000 ? ' A precisão da sua localização é de aproximadamente ' + Math.round(position.coords.accuracy / 1000) + ' km.' : ''));
            render(true);
        }, function (error) {
            if (current !== requestId) return;
            localizar.disabled = false;
            localizar.textContent = origem ? 'Atualizar localização' : 'Usar minha localização';
            var messages = {1: 'Acesso à localização não permitido. Você pode liberá-lo nas configurações do navegador ou pesquisar por cidade, bairro ou CEP.',
                2: 'Sua localização está indisponível no momento. Tente novamente ou pesquise por cidade, bairro ou CEP.',
                3: 'A consulta à localização demorou mais que o esperado. Tente novamente ou use os filtros.'};
            aviso(messages[error.code] || 'Não foi possível obter sua localização. Use os filtros ou tente novamente.', true);
        }, {enableHighAccuracy: false, timeout: 12000, maximumAge: 60000});
    });
    render(true);
})(typeof window !== 'undefined' ? window : globalThis);
