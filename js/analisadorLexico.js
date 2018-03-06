$(document).ready(function(){
    $('textarea').bind('keydown', function(e) {
        if(e.keyCode === 9) {
            e.preventDefault();
            var inicioDaSelecao = this.selectionStart,
                fimDaSelecao = this.selectionEnd,
                recuo = '\t'; //Experimente também com '    '

            this.value = [
                this.value.substring(0, inicioDaSelecao),
                recuo,
                this.value.substring(fimDaSelecao)
            ].join('');

            this.selectionEnd = inicioDaSelecao + recuo.length;
        }
    });

    $("#codigo").on("keyup", (function(e) {
        analisar();
    }));
    analisar();
});

//Objeto para os Tokens
function Token(tipo, valor, valido, detalhe) {
    this.tipo = tipo;
    this.valor = valor;
    this.detalhe = detalhe;
    this.valido = valido;
}

var palavrasReservadas = ['<?php', '?>', '__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor'];

var tokensGlobais = [];

//Função geral, responsavel pelo começo da validação do código
function analisar() {
    tokensGlobais = [];

    var codigo = $("#codigo").val();
    var caracteres = codigo.split('');

    while (caracteres.length > 0) {
        //Convertendo o caracter lido para um inteiro
        var caracter = caracteres[0].charCodeAt(0);
        var caracterO = caracteres[0];

        //Objeto que receberá o token reconhecido
        var token = new Token();

        //Verificações para identificar o tipo do caracter lido
        //Numerico
        if (caracter >= 48 && caracter <= 57) {
            token = validarTokenNumerico(caracteres);
        }

        //String
        else if (caracter == 34) {
            token = validarTokenString(caracteres);
        }

        //Identificador
        else if ((caracter == 60) || (caracter == 63) || (caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122)) {
            token = validarTokenIdentificador(caracteres);
        }

        //Caracteres descartados
        else if (caracter == 32) {
            token = new Token("ESPAÇO", caracterO, true);
        }

        else if (caracter == 10) {
            token = new Token("QUEBRA DE LINHA", caracterO, true);
        }

        //Tokens especiais
        else {
            if (caracteres.length > 1) {
                //Comentario
                if ((caracteres[0] + caracteres[1] == "//") || (caracteres[0] + caracteres[1] == "/*")) {
                    token = validarTokenComentario(caracteres);
                }
                else {
                    //outros tokens
                    token = validarTokenEspeciais(caracteres);
                }
            }
            else {
                //outros tokens
                token = validarTokenEspeciais(caracteres);
            }
        }

        //console.log(token);
        for(i = 0; i < token.valor.length; i++) {
            caracteres.shift();
        }

        if (token.tipo == "IDENTIFICADOR") {
            if (palavrasReservadas.indexOf(token.valor) > -1) {
                token.detalhe = "PALAVRA RESERVADA"
            }
        }

        tokensGlobais.push(token);
    }

    console.log(tokensGlobais);

    //Habilitando a tabela com as classificações
    $("#tabela").css("visibility","visible");

    //Lipando a tabela com as classificações
    $("#tabela").find("tbody").find(".linha").remove();

    //Adicionando as linhas na tabela de classificação
    $.each(tokensGlobais, function( key, value ) {
        if ((value.tipo !== "ESPAÇO") && (value.tipo !== "QUEBRA DE LINHA") && (value.valor !== "\t")) {
            //alert(value.valor);
            value.detalhe = value.detalhe == undefined ? "" : value.detalhe;
            value.valido = value.valido ? "Válido" : "Inválido";
            $("#tabela").find("tbody").append("<tr class='linha'>" +
                                                "<td>-</td>" +
                                                "<td>-</td>" +
                                                "<td>-</td>" +
                                                "<td><input type='text' readonly value='" + value.valor + "'</td>" +
                                                "<td>" + value.tipo + "</td>" +
                                                "<td>" + value.detalhe + "</td>" +
                                                "<td>" + value.valido + "</td>" +
                                              "</tr>");
        }
    });
}

function validarTokenNumerico(caracteres) {
    var token = new Token("NUMERICO", "", true, "");
    var ponto = false;

    for (i = 0; i < caracteres.length; i++) {
        var caracter = caracteres[i].charCodeAt(0);
        if (caracter >= 48 && caracter <= 57) {
            token.valor += caracteres[i];
        }
        else if (caracter == 46 && !ponto) {
            token.valor += caracteres[i];
            ponto = true;
        }
        else {
            if (token.valor.length > 0) {
                break;
            }
            else {
                token.valido = false;
            }
        }
    }

    return token;
}

function validarTokenString(caracteres) {
    var token = new Token("STRING", "", true);
    var fechamento = false;

    if (caracteres[0] == '\"') {
        for (i = 1; i < caracteres.length; i++) {
            if (token.valido) {
                if (caracteres[i] == '\n') {
                    token.valor += caracteres[i];
                    token.valido = false;
                }
                else if (caracteres[i] != '\"') {
                    token.valor += caracteres[i];
                }
                else {
                    token.valor = "\"" + token.valor + "\"";
                    fechamento = true;
                    break;
                }
            }
            else {
                break;
            }
        }

        if (!fechamento) {
            token.valido = false;
        }
    }
    return token;
}

function validarTokenIdentificador(caracteres) {
    var token = new Token("IDENTIFICADOR", "", true);

    var caracter = caracteres[0].charCodeAt(0);

    if (caracter == 63 && caracteres[1].charCodeAt(0) == 62) {
        token.valor = caracteres[0] + caracteres[1];
    }
    else if ((caracter == 60) || (caracter == 63) || (caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122)) {
        token.valor = caracteres[0];
        for (i = 1; i < caracteres.length; i++) {
            caracter = caracteres[i].charCodeAt(0);
            if ((caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122) || (caracter >= 48 && caracter <= 57) || caracter == 95 || caracter == 63 || caracter == 62) {
                token.valor = token.valor + caracteres[i];
            }
            else break;
        }
        token.valido = true;
    }
    else {
        token.valido = false;
    }

    return token;
}

function validarTokenComentario(caracteres) {
    var token = new Token("COMENTÁRIO", "", true);

    if (caracteres[0] + caracteres[1] == "//") {

        token.detalhe = "COMENTÁRIO EM LINHA";

        //Verifica se o subprograma é maior que zero
        if (caracteres.length > 1) {
            //Verifica se os dois primeiros caracteres são //
            if (caracteres[0] == '/' && caracteres[1] == '/') {
                token.valor = "//";

                //Concatena todos os caracteres no comentario até achar um \n
                for (i = 2; i < caracteres.length; i++) {
                    if (caracteres[i] != '\n') {
                        token.valor += caracteres[i];
                    }
                    else {
                        break;
                    }
                }
            }
            else {
                token.valido = false;
            }
        }
        else {
            token.valido = false;
        }
    }
    else {
        var fechamento = false;
        token.detalhe = "COMENTÁRIO EM BLOCO";

        for (i = 2; i < caracteres.length; i++) {
            if (token.valido) {
                if (caracteres[i] != '\/') {
                    token.valor += caracteres[i];
                }
                else {
                    token.valor = "\/*" + token.valor + "\/";
                    fechamento = true;
                    break;
                }
            }
            else {
                break;
            }
        }

        if (!fechamento) {
            token.valido = false;
        }
    }

    return token;
}

function validarTokenEspeciais(caracteres) {
    var operadoresUmChar = [], operadoresDoisChar = [];

    operadoresUmChar.push(
        new Token("OPERADOR", "+", true, "OPERADOR DE ADIÇÃO"),
        new Token("OPERADOR", "-", true, "OPERADOR DE SUBTRAÇÃO"),
        new Token("OPERADOR", "*", true, "OPERADOR DE MULTIPLICAÇÃO"),
        new Token("OPERADOR", "/", true, "OPERADOR DE DIVISÃO"),
        new Token("OPERADOR", "%", true, "OPERADOR DE RESTO"),
        new Token("OPERADOR", "^", true, "OPERADOR DE POTENCIAÇÃO"),
        new Token("OPERADOR", "<", true, "OPERADOR MENOR QUE"),
        new Token("OPERADOR", ">", true, "OPERADOR MAIOR QUE"),
        new Token("ATRIBUIÇÃO", "=", true, "OPERADOR DE ATRIBUIÇÃO"),
        new Token("PONTUAÇÃO", ",", true, "SEPARADOR DE ARGUMENTOS"),
        new Token("PONTUAÇÃO", ";", true, "FINALIZADOR DE COMANDO"),
        new Token("PARENTIZADOR","{", true, "ABERTURA DE CHAVE"),
        new Token("PARENTIZADOR","[", true, "ABERTURA DE COLCHETE"),
        new Token("PARENTIZADOR","(", true, "ABERTURA DE PARENTESE"),
        new Token("PARENTIZADOR",")", true, "FECHAMENTO DE PARENTESE"),
        new Token("PARENTIZADOR","]", true, "FECHAMENTO DE COLCHETE"),
        new Token("PARENTIZADOR","}", true, "FECHAMENTO DE CHAVE")
    );

    operadoresDoisChar.push(
        new Token("OPERADOR", "++", true, "OPERADOR DE INCREMENTO"),
        new Token("OPERADOR", "--", true, "OPERADOR DE DECREMENTO"),
        new Token("OPERADOR", ">=", true, "COMPARADOR MAIOR OU IGUAL QUE"),
        new Token("OPERADOR", "<=", true, "COMPARADOR MENOR OU IGUAL QUE"),
        new Token("OPERADOR", "==", true, "COMPARADOR IGUALDADE"),
        new Token("OPERADOR", "&&", true, "OPERADOR E"),
        new Token("OPERADOR", "||", true, "OPERADOR OU"),
        new Token("OPERADOR", "!=", true, "COMPARADOR DIFERENTE")
    );

    var token = new Token("DESCONHECIDO", " ", true, "");

    $.each(operadoresUmChar, function( key, value ) {
        if(value.valor == caracteres[0]) {
            token = value;
        }
    });

    if (caracteres.length > 1) {
        $.each(operadoresDoisChar, function( key, value ) {
            if(value.valor == (caracteres[0] + caracteres[1])) {
                token = value;
            }
        });
    }

    if (token.valor == " ") {
        token.valor = caracteres[0];
        token.valido = false;
    }

    return token;
}