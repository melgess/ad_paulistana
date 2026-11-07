(function () {
    'use strict';

    var id = new URLSearchParams(window.location.search).get('pastor');
    var pastores = window.ADPASTORES || [];
    var pastor = pastores.find(function (item) { return item.id === id; });

    if (!pastor) {
        if (id) {
            document.title = 'Pastor não encontrado | AD Paulistana';
            document.getElementById('biografia-aviso-titulo').textContent = 'Pastor não encontrado';
            document.getElementById('biografia-aviso-texto').textContent = 'Confira o endereço ou escolha um pastor na seção de liderança.';
        }
        return;
    }

    document.title = pastor.nome + ' | AD Paulistana';
    document.querySelector('meta[name="description"]').content = 'Conheça ' + pastor.nome + ', ' + pastor.cargo + ' da AD Paulistana.';
    document.getElementById('biografia-nome').textContent = pastor.nome;
    document.getElementById('biografia-cargo').textContent = pastor.cargo;

    var foto = document.getElementById('biografia-foto');
    foto.src = pastor.foto;
    foto.alt = pastor.nome;

    var texto = document.getElementById('biografia-texto');
    pastor.biografia.forEach(function (paragrafo) {
        var p = document.createElement('p');
        p.textContent = paragrafo;
        texto.appendChild(p);
    });

    if (pastor.instagram) {
        var instagram = document.getElementById('biografia-instagram');
        instagram.href = pastor.instagram;
        instagram.hidden = false;
    }

    document.getElementById('biografia-aviso').hidden = true;
    document.getElementById('biografia-perfil').hidden = false;
})();
