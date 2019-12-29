/* ----------------------------------------------------
    PARTE 1:
        Criar e definir tudo
   ---------------------------------------------------- */

// DEFINIR O CANVAS
var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d"); // "contexto do desenho"

// DIMENSÕES DO CANVAS
canvas.width = 450;  // largura
canvas.height = 450; // altura

// DEFINIR O FPS
const FPS = 15;
var intervalo = 1000 / FPS; /* intervalo em milissegundos entre duas gerações
                               a velocidade verdadeira da animação pode
                               variar entre computadores e navegadores.
                               Valor define a velocidade máxima da animação. */

// DEFINIR AS CÉLULAS
var tamanhoCelula = 15;             // pixels, usado no desenho e espera de evento de clique
var corCelulaViva = "lightgreen";   // verde claro
var corCelulaMorta = "grey";        // cinza
var corBorda = "black";             // preto
context.lineWidth = 1;              // espessura da linha
context.strokeStyle = corBorda;     // "estilo da linha"

// DEFINIR ARMA DE GLIDERS
var fileirasTabuleiro = 30;
var colunasTabuleiro = 30;

// ANIMAÇÃO
var animado = false
var lacoAtivo;

/* ----------------------------------------------------
    PARTE 2:
        Criar representações de células e do tabuleiro
   ---------------------------------------------------- */

// CRIAR A CLASSE DA CÉLULA
class Celula {
    constructor(fileira, coluna) {
        // Lembrar a fileira e coluna para a hora de desenhar
        this.fileira = fileira;
        this.coluna = coluna;

        // Começamos com células mortas, vazias
        this.viva = false;

        // Variável temporária para determinar estado na próxima geração
        this.vivaNaProximaGeração = false;
    }
    desenhe() {
        // Local no canvas, canto superior à esquerda da célula
        var cantoX = tamanhoCelula * this.coluna;
        var cantoY = tamanhoCelula * this.fileira;

        // Cor da célula
        var corCelula;
        if (this.viva) {
            corCelula = corCelulaViva;
        } else {
            corCelula = corCelulaMorta;
        }

        // Preencher o interior da célula
        context.fillStyle = corCelula;
        context.fillRect(cantoX, cantoY, tamanhoCelula, tamanhoCelula);

        // Desenhar borda
        context.strokeRect(cantoX, cantoY, tamanhoCelula, tamanhoCelula);
    }
}

// CRIAR A CLASSE DO TABULEIRO
class Tabuleiro {
    constructor(fileiras, colunas) {
        this.fileiras = fileiras;
        this.colunas = colunas;
        /* Array ou Lista, externo de fileiras. Cada fileira, que é em si
           um Array, terá as células individuais. */
        this.celulas = [];
        for (let fileira = 0; fileira < this.fileiras; fileira++) {
            this.celulas[fileira] = []; // Inicializar Array para as células
            for (let coluna = 0; coluna < this.colunas; coluna++) {
                this.celulas[fileira][coluna] = new Celula(fileira, coluna);
            }
        }
        this.desenhe();
    }

    // "Desenhar o tabuleiro"
    desenhe() {
        for (let fileira = 0; fileira < this.fileiras; fileira++) {
            for (let coluna = 0; coluna < this.colunas; coluna++) {
                this.celulas[fileira][coluna].desenhe();
            }
        }
    }

    // Contar quantas células vizinhas estão "vivas"
    contarVizinhasVivas(fileira, coluna) {
        var vizinhasVivas = 0;
        for (let f = fileira - 1; f <= fileira + 1; f++) {
            for (let c = coluna - 1; c <= coluna + 1; c++) {
                // Não contar a célula em si
                if (!(f == fileira && c == coluna)) {
                    // Validar coordenadas para evitar erros
                    // Células fora do tabuleiro são "mortas"
                    if (f >= 0 && f < this.fileiras && c >= 0 && c < this.colunas) {
                        if (this.celulas[f][c].viva) {
                            vizinhasVivas++;
                        }
                    }
                }
            }
        }
        return vizinhasVivas;
    }

    // Determinar qual será o estado de uma célula na próxima geração
    celulaProximaGeracao(fileira, coluna) {
        var vizinhasVivas = this.contarVizinhasVivas(fileira, coluna);
        var celula = this.celulas[fileira][coluna];
        var vivaNaProximaGeracao;

        if (this.celulas[fileira][coluna].viva) {
            /* Célula está viva atualmente, com 2 ou 3 vizinhas vivas,
               continuará viva */
            if (vizinhasVivas == 2 || vizinhasVivas == 3) {
                vivaNaProximaGeracao = true;
            } else {
                vivaNaProximaGeracao = false;
            }
        } else {
            /* A célula está morta atualmente, com exatamente 3 vizinhas vivas,
               nascerá na próxima geração */
            if (vizinhasVivas == 3) {
                vivaNaProximaGeracao = true;
            } else {
                vivaNaProximaGeracao = false;
            }
        }

        celula.vivaNaProximaGeracao = vivaNaProximaGeracao;
        return vivaNaProximaGeracao;
    }

    // Finalmente, usar essa regra em todas as células do tabuleiro
    tabuleiroProximaGeracao() {
        // Calcular o estado de cada célula uma por uma
        for (let f = 0; f < this.fileiras; f++) {
            for (let c = 0; c < this.colunas; c++) {
                this.celulaProximaGeracao(f, c);
            }
        }

        /* Em seguida, atualizar a propriedade viva. Este processo tem que
           ser feito em duas etapas porque as células crescem ou morrem
           simultaneamente. */
        for (let f = 0; f < this.fileiras; f++) {
            for (let c = 0; c < this.colunas; c++) {
                this.celulas[f][c].viva = this.celulas[f][c].vivaNaProximaGeracao;
            }
        }
        this.desenhe();
    }

    // Limpar o tabuleiro
    limpeTabuleiro() {
        for (let f = 0; f < this.fileiras; f++) {
            for (let c = 0; c < this.colunas; c++) {
                this.celulas[f][c].viva = false;
            }
        }
        this.desenhe();
    }

    // Definir células vivas
    darVida(fileira, coluna) {
        this.colunas[fileira][coluna].viva = true;
    }

    // Criar criatura
    criarCriatura(coordinates) {
        coordinates.forEach(function (point) {
            // Desempacota a fileira e coluna de cada par e cama darVida()
            this.darVida.apply(this, point);
        }, this);
    }
}

// INICIALIZAR O TABULEIRO
var tabuleiro = new Tabuleiro(fileirasTabuleiro, colunasTabuleiro);

/* ----------------------------------------------------
    PARTE 3:
        Adicionar interatividade ao tabuleiro
   ---------------------------------------------------- */

canvas.addEventListener('click', function(event) {
    // Obter a posição relativa à janela
    var boudingRect = this.getBoundingClientRect();

    // Calcular o ponto dentro do canvas
    var x = event.clientX - boudingRect.left;
    var y = event.clientY - boudingRect.top;

    var fileira = Math.floor(y / tamanhoCelula);
    var coluna = Math.floor(x / tamanhoCelula);

    // O clique inverte o estado da célula (vivo para morto e vice versa)
    tabuleiro.celulas[fileira][coluna].viva = !tabuleiro.celulas[fileira][coluna].viva;
    tabuleiro.celulas[fileira][coluna].desenhe();
});

/* ----------------------------------------------------
    PARTE 5:
        Animar o tabuleiro geração após geração,
        usando JQuery para simplificar a conexão
        entre os botões e as funções JS
   ---------------------------------------------------- */

function lacoDeAnimacao() {
    /* Usar intervalo para fazer a velocidade da animação
       o desejado numero de FPS */
    setTimeout(function() {
       if (animado) {
           lacoAtivo = requestAnimationFrame(lacoDeAnimacao);
           tabuleiro.tabuleiroProximaGeracao();
       }
    }, intervalo);
}

// Botão de iniciar
$("#animacao").click(function () {
    animado = true;
    lacoDeAnimacao();
    $(this).attr("disabled", true);
    $("#geracao").attr("disabled", true);
});

// Botão de nova geração
$("#geracao").click(function() {
    tabuleiro.tabuleiroProximaGeracao();
});

// Botão parar
$("#pare").click(function() {
    animado = false;
    cancelAnimationFrame(lacoAtivo);
    $("#animacao").removeAttr("disabled");
    $("#geracao").removeAttr("disabled");
});

// Botão limpar
$("#limpe").click(function() {
    $("#pare").click(); // Simula um clique no botão pare
    tabuleiro.limpeTabuleiro();
});
