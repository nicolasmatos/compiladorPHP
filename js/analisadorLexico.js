$(document).ready(function(){
    toastr.options = {
        "closeButton": true,
        "debug": false,
        "newestOnTop": false,
        "progressBar": true,
        "positionClass": "toast-bottom-right",
        "preventDuplicates": false,
        "onclick": null,
        "showDuration": "300",
        "hideDuration": "1000",
        "timeOut": "6000",
        "extendedTimeOut": "1000",
        "showEasing": "swing",
        "hideEasing": "linear",
        "showMethod": "fadeIn",
        "hideMethod": "fadeOut"
    };

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
function Token(tipo, valor, valido, detalhe, escopo) {
    this.tipo = tipo;
    this.valor = valor;
    this.detalhe = detalhe;
    this.valido = valido;
    this.escopo = escopo;
}

var palavrasReservadas = ['<?php', '?>', '__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor'];

var tokensGlobais = [];

var escopo = 0;

//Função geral, responsavel pelo começo da validação do código
function analisar() {
    tokensGlobais = [];
    escopo = 0;

    analizadorLexico();
    analizadorSintatico();
    analizadorSemantico();

    //Habilitando a tabela com as classificações
    $("#tabela").css("visibility","visible");

    //Lipando a tabela com as classificações
    $("#tabela").find("tbody").find(".linha").remove();

    var tokensVisitado = [];
    var qtd = 1;
    var linha = 1, coluna = 1;

    //Adicionando as linhas na tabela de classificação
    $.each(tokensGlobais, function( key, value ) {
        //if (tokensVisitado.indexOf(value.valor) == -1) {
            if ((value.tipo !== "ESPAÇO") && (value.tipo !== "QUEBRA DE LINHA") && (value.valor !== "\t")) {
                //alert(value.valor);
                value.detalhe = value.detalhe == undefined ? "" : value.detalhe;
                value.valido = value.valido ? "Válido" : "Inválido";
                $("#tabela").find("tbody").append("<tr class='linha'>" +
                    "<td>"+ (qtd++) +"</td>" +
                    "<td>"+ linha +"</td>" +
                    "<td>"+ (coluna++) +"</td>" +
                    "<td>-</td>" +
                    "<td>" + value.escopo + "</td>" +
                    "<td><input type='text' readonly value='" + value.valor + "'</td>" +
                    "<td>" + value.tipo + "</td>" +
                    "<td>" + value.detalhe + "</td>" +
                    "<td>" + value.valido + "</td>" +
                    "</tr>");

                tokensVisitado.push(value.valor);
            }
            else if (value.tipo === "QUEBRA DE LINHA") {
                linha++;
                coluna = 1;
            }
        //}
    });
}

function analizadorLexico() {
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
        if ((caracter == 45 && (caracteres[1].charCodeAt(0) >= 48 && caracteres[1].charCodeAt(0) <= 57)) || (caracter >= 48 && caracter <= 57)) {
            token = validarTokenNumerico(caracteres);
        }

        //String
        else if (caracter == 34) {
            token = validarTokenString(caracteres);
        }

        //Identificador
        else if ((caracter == 36) || (caracter == 60) || (caracter == 63) || (caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122)) {
            token = validarTokenIdentificador(caracteres);
        }

        //Caracteres descartados
        else if (caracter == 32) {
            token = new Token("ESPAÇO", caracterO, true, "", escopo);
        }

        else if (caracter == 10) {
            token = new Token("QUEBRA DE LINHA", caracterO, true, "", escopo);
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

        var tam = 0;
        if(token.detalhe == "VARIÁVEL LOCAL") {
            var valorQ = (token.valor).split(".");
            tam = valorQ[0].length;
        }
        else {
            tam = token.valor.length;
        }
        for(i = 0; i < tam; i++) {
            caracteres.shift();
        }

        if (token.tipo == "IDENTIFICADOR") {
            if (palavrasReservadas.indexOf(token.valor) > -1) {
                token.detalhe = "PALAVRA RESERVADA"
            }
            if (token.detalhe != "FUNÇÃO" && token.detalhe != "VARIÁVEL GLOBAL" && token.detalhe != "VARIÁVEL LOCAL" && token.detalhe != "PALAVRA RESERVADA") {
                token.detalhe = "";
                token.valido = false;
            }
        }

        tokensGlobais.push(token);
    }
}

function analizadorSintatico() {
    var ctrExpressao = 0;
    var parenteses = [];
    var parentesesAbrindo = [];
    var parentesesFechando = [];
    var expressao = [];
    var pontoVìrgula = [];
    var varsDeclaradas = [];

    console.clear();

    var linha = 1;
    var controleExpressao = 1;
    $.each(tokensGlobais, function( key, value ) {
        if (value.detalhe == "ABERTURA DE PARENTESE") {
            parenteses.push(value);
            parentesesAbrindo.push(value);

            //Inicio ignorando os parâmentros de funções
            var i = 1;
            while((key - i) >= 0) {
                if ((tokensGlobais[key - i].tipo !== "ESPAÇO") && (tokensGlobais[key - i].valor !== "\t")) {
                    if (tokensGlobais[key - i].detalhe === "FUNÇÃO" || tokensGlobais[key - i].detalhe === "PALAVRA RESERVADA") {
                        controleExpressao = 0;
                    }
                    break;
                }
                i++;
            }//Fim ignorando os parâmentros de funções
        }

        if (controleExpressao && (value.tipo == "NUMERICO" || value.detalhe == "VARIÁVEL GLOBAL" || value.detalhe == "VARIÁVEL LOCAL")) {
            //Inicio Verificando se for um número negativo
            if(value.valor < 0) {
                if(expressao.length !== 0) {
                    var aux = expressao.pop();
                    if(aux !== "(") {
                        expressao.push(aux);
                        expressao.push("OP");
                    }
                    else {
                        expressao.push(aux);
                    }
                }
            }
            //Fim Verificando se for um número negativo

            //Inicio Valida numérico
            var aux1 = expressao.pop();
            var aux2 = expressao.pop();

            if (aux1 != undefined) {
                if (aux2 != undefined) {
                    if (aux1 == "OP" && aux2 == "EXPR") {
                        expressao.push("EXPR");
                    }
                    else {
                        expressao.push(aux2);
                        expressao.push(aux1);
                        expressao.push("EXPR");
                    }
                }
                else {
                    expressao.push(aux1);
                    expressao.push("EXPR");
                }
            }
            else {
                expressao.push("EXPR");
            }
            //FIM Valida numérico
        }
        else if (controleExpressao && (value.detalhe == "ABERTURA DE PARENTESE")) {
            expressao.push("(");
        }
        else if (controleExpressao && (value.detalhe == "OPERADOR DE ADIÇÃO" || value.detalhe == "OPERADOR DE SUBTRAÇÃO" || value.detalhe == "OPERADOR DE MULTIPLICAÇÃO" || value.detalhe == "OPERADOR DE DIVISÃO")) {
            expressao.push("OP");
        }
        else if (controleExpressao && (value.detalhe == "FECHAMENTO DE PARENTESE")) {
            var aux1 = expressao.pop();
            var aux2 = expressao.pop();

            if (aux1 !== undefined) {
                if (aux2 !== undefined) {
                    if (aux1 === "EXPR" && aux2 === "(") {
                        //Inicio Valida numérico
                        var aux1 = expressao.pop();
                        var aux2 = expressao.pop();

                        if (aux1 !== undefined) {
                            if (aux2 !== undefined) {
                                if (aux1 === "OP" && aux2 === "EXPR") {
                                    expressao.push("EXPR");
                                }
                                else {
                                    expressao.push(aux2);
                                    expressao.push(aux1);
                                    expressao.push("EXPR");
                                }
                            }
                            else {
                                expressao.push(aux1);
                                expressao.push("EXPR");
                            }
                        }
                        else {
                            expressao.push("EXPR");
                        }
                        //FIM Valida numérico
                    }
                    else {
                        expressao.push(aux2);
                        expressao.push(aux1);
                        expressao.push(")");
                    }
                }
                else {
                    expressao.push(aux1);
                    expressao.push(")");
                }
            }
            else {
                expressao.push(")");
            }
        }
        else {
            if (expressao.length > 0 && value.detalhe !== "FINALIZADOR DE COMANDO" && value.tipo !== "ESPAÇO" && value.tipo !== "QUEBRA DE LINHA" && value.detalhe !== "OPERADOR DE ATRIBUIÇÃO")
                expressao.push("ERRO");
        }

        if (value.detalhe == "FECHAMENTO DE PARENTESE") {
            parenteses.pop();
            parentesesFechando.push(value);
            controleExpressao = 1;
        }

        //INICIO verifica ponto e vírgula
        pontoVìrgula.push(value);
        if(value.valor == "\n") {
            var a = pontoVìrgula.pop();
            var b = pontoVìrgula.pop();
            if (b.valor != "{" && b.valor != "}" && b.valor != "<?php" && b.valor != "?>" && b.valor != "\n" && b.tipo != "COMENTÁRIO") {
                if (b.valor != ";") {
                    erroSintatico("Falta ponto e vírgula", linha);
                }
            }
            pontoVìrgula.push(b);
            pontoVìrgula.push(a);
        }
        //FIM verifica ponto e virgula

        //Verificações de erros
        if(value.detalhe == "VARIÁVEL GLOBAL" || value.detalhe == "VARIÁVEL LOCAL") {
            var i = 1;
            while((key + i) < tokensGlobais.length-1) {
                if ((tokensGlobais[key + i].tipo !== "ESPAÇO") && (tokensGlobais[key + i].valor !== "\t")) {
                    if (tokensGlobais[key + i].detalhe === "OPERADOR DE ATRIBUIÇÃO") {
                        var valor = value.valor.split('.');
                        if(varsDeclaradas.indexOf(valor[0]) === -1)
                            varsDeclaradas.push(valor[0]);
                    }
                    else {
                        var valor = value.valor.split('.');
                        if(varsDeclaradas.indexOf(valor[0]) === -1)
                            erroSintatico("Variável não foi declarada. :´(", linha);
                    }
                    break;
                }
                i++;
            }
        }

        if(expressao.length != 0) {
            console.log("-----------------");
            console.log(expressao);
        }

        if(expressao.length === 1) {
            var aux = expressao.pop();
            if(aux !== "EXPR") {
                if(aux !== "(") {
                    expressao = [];
                    if (aux === "OP")
                        erroSintatico("Existe um operador sobrando na expressão!", linha);
                    else if (aux === ")")
                        erroSintatico("Existe um fechamento de parêntese sobrando na expressão!", linha);
                    else
                        erroSintatico("Existe alguma expressão inválida", linha);
                }
                else {
                    expressao.push("(");
                }
            }
            else {
                expressao.push("EXPR");
            }
        }

        if (value.tipo === "QUEBRA DE LINHA" || value.detalhe === "FINALIZADOR DE COMANDO" || value.detalhe === "OPERADOR DE ATRIBUIÇÃO") {
            if(expressao.length > 1) {
                erroSintatico("Existe alguma expressão inválida", linha);
            }
            console.log("\n\n\n");

            expressao = [];
        }

        if (value.tipo === "QUEBRA DE LINHA") {
            linha++;
        }
    });

    if((parenteses.length != 0) || (parentesesAbrindo.length != parentesesFechando.length))
        erroSintatico("Existe algum problema nas estruturas de parênteses. :´(", '');
}

function analizadorSemantico() {

}

function validarTokenNumerico(caracteres) {
    var token = new Token("NUMERICO", "", true, "", escopo);
    var ponto = false;

    token.valor += caracteres[0];

    for (i = 1; i < caracteres.length; i++) {
        var caracter = caracteres[i].charCodeAt(0);
        if (caracter >= 48 && caracter <= 57) {
            token.valor += caracteres[i];
        }
        else if (caracter == 46 && !ponto) {
            token.valor += caracteres[i];
            ponto = true;
        }
        else if (caracter == 69 || caracter == 101) {
            token.valor += caracteres[i];
            token.detalhe = "NOTAÇÃO";
            for (j = i + 1; j < caracteres.length; j++) {
                var caracter2 = caracteres[j].charCodeAt(0);
                if (caracteres[j] != "\n" && caracteres[j] != ";") {
                    if (caracter2 == 45 || (caracter2 >= 48 && caracter2 <= 57)) {
                        token.valor += caracteres[j];
                        var ponto = false;

                        for (k = j + 1; k < caracteres.length; k++) {
                            var caracter = caracteres[k].charCodeAt(0);
                            if (caracter >= 48 && caracter <= 57) {
                                token.valor += caracteres[k];
                            }
                            else if (caracter == 46 && !ponto) {
                                token.valor += caracteres[k];
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
                        break;
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
            }
            break;
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
    var token = new Token("STRING", "", true, "", escopo);
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
    var token = new Token("IDENTIFICADOR", "", true, "", escopo);

    var caracter = caracteres[0].charCodeAt(0);
    //alert(caracter);

    if (caracter == 63 && caracteres[1].charCodeAt(0) == 62) {
        token.valor = caracteres[0] + caracteres[1];
    }
    else if ((caracter == 36)) {
        if (escopo != 0)
            token.detalhe = "VARIÁVEL LOCAL";
        else
            token.detalhe = "VARIÁVEL GLOBAL";

        token.valor = caracteres[0];
        if (caracteres[1].charCodeAt(0) >= 48 && caracteres[1].charCodeAt(0) <= 57) {
            token.valor += caracteres[1];
            token.valido = false;
        }
        else {
            for (i = 1; i < caracteres.length; i++) {
                caracter = caracteres[i].charCodeAt(0);
                if ((caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122) || (caracter >= 48 && caracter <= 57) || caracter == 95) {
                    token.valor = token.valor + caracteres[i];
                }
                else break;
            }
            token.valido = true;
        }

        if (escopo != 0) {
            for(i = tokensGlobais.length - 1; i >= 0; i--) {
                if(tokensGlobais[i].detalhe == "FUNÇÃO") {
                    if(tokensGlobais[i].escopo != token.escopo) {
                        token.valor += "." + tokensGlobais[i].valor;
                        break;
                    }
                }
            }
        }
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

    var tam = 0;
    if(token.detalhe == "VARIÁVEL LOCAL") {
        var valorQ = (token.valor).split(".");
        tam = valorQ[0].length;
    }
    else {
        tam = token.valor.length;
    }

    for (i = tam; i < caracteres.length; i++) {
        if (caracteres[i] == " " || caracteres[i] == "\t") {}
        else if (caracteres[i] == "(") {
            token.detalhe = "FUNÇÃO";
            token.escopo = escopo;
            break;
        }
        else {
            break;
        }
    }

    return token;
}

function validarTokenComentario(caracteres) {
    var token = new Token("COMENTÁRIO", "", true, "", escopo);

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

var controleEscopo = 1;

function validarTokenEspeciais(caracteres) {
    var operadoresUmChar = [], operadoresDoisChar = [];

    if (caracteres[0] == "}")
        escopo--;

    if (caracteres[0] == ")") {
        if (controleEscopo)
            escopo--;
    }

    operadoresUmChar.push(
        new Token("CONCATENAÇÃO", ".", true, "OPERADOR DE CONCATENAÇÃO", escopo),
        new Token("OPERADOR", "+", true, "OPERADOR DE ADIÇÃO", escopo),
        new Token("OPERADOR", "-", true, "OPERADOR DE SUBTRAÇÃO", escopo),
        new Token("OPERADOR", "*", true, "OPERADOR DE MULTIPLICAÇÃO", escopo),
        new Token("OPERADOR", "/", true, "OPERADOR DE DIVISÃO", escopo),
        new Token("OPERADOR", "%", true, "OPERADOR DE RESTO", escopo),
        new Token("OPERADOR", "^", true, "OPERADOR DE POTENCIAÇÃO", escopo),
        new Token("OPERADOR", "<", true, "OPERADOR MENOR QUE", escopo),
        new Token("OPERADOR", ">", true, "OPERADOR MAIOR QUE", escopo),
        new Token("ATRIBUIÇÃO", "=", true, "OPERADOR DE ATRIBUIÇÃO", escopo),
        new Token("PONTUAÇÃO", ",", true, "SEPARADOR DE ARGUMENTOS", escopo),
        new Token("PONTUAÇÃO", ";", true, "FINALIZADOR DE COMANDO", escopo),
        new Token("PARENTIZADOR","{", true, "ABERTURA DE CHAVE", escopo),
        new Token("PARENTIZADOR","[", true, "ABERTURA DE COLCHETE", escopo),
        new Token("PARENTIZADOR","(", true, "ABERTURA DE PARENTESE", escopo),
        new Token("PARENTIZADOR",")", true, "FECHAMENTO DE PARENTESE", escopo),
        new Token("PARENTIZADOR","]", true, "FECHAMENTO DE COLCHETE", escopo),
        new Token("PARENTIZADOR","}", true, "FECHAMENTO DE CHAVE", escopo)
    );

    operadoresDoisChar.push(
        new Token("OPERADOR", "++", true, "OPERADOR DE INCREMENTO", escopo),
        new Token("OPERADOR", "--", true, "OPERADOR DE DECREMENTO", escopo),
        new Token("OPERADOR", ">=", true, "COMPARADOR MAIOR OU IGUAL QUE", escopo),
        new Token("OPERADOR", "<=", true, "COMPARADOR MENOR OU IGUAL QUE", escopo),
        new Token("OPERADOR", "==", true, "COMPARADOR IGUALDADE", escopo),
        new Token("OPERADOR", "&&", true, "OPERADOR E", escopo),
        new Token("OPERADOR", "||", true, "OPERADOR OU", escopo),
        new Token("OPERADOR", "!=", true, "COMPARADOR DIFERENTE", escopo)
    );

    var token = new Token("DESCONHECIDO", " ", true, "");

    if (caracteres[0] == "{")
        escopo++;

    if (caracteres[0] == "(") {
        for(i = tokensGlobais.length - 1; i >= 0; i--) {
            if(tokensGlobais[i].tipo != "ESPAÇO" && tokensGlobais[i].tipo != "QUEBRA DE LINHA") {
                if(tokensGlobais[i].detalhe == "FUNÇÃO") {
                    escopo++;

                    controleEscopo = 1;
                }
                else {
                    controleEscopo = 0;
                }
                break;
            }
        }
    }

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

function autoIdentar() {
    analisar();
    var qtd = 0;
    var tokensQuebra = ['<?php', '{', '}', ';'];

    var codigoIdentado = '';


    var tokensValidos = [];

    $.each(tokensGlobais, function( key, value ) {
        if (value.tipo != "QUEBRA DE LINHA" && value.tipo != "ESPAÇO" && value.valor != "\t"){
            tokensValidos.push(value);
        }
    });

    $.each(tokensValidos, function( key, value ) {
        if(value.valor === "{") qtd++;
        if(value.valor === "}") qtd--;
        if(value.valor === "<?php") qtd++;
        if (tokensQuebra.indexOf(value.valor) > -1) {

            if(value.valor === '}'){
                codigoIdentado = codigoIdentado.substring(0, codigoIdentado.length - 1);
            }

            codigoIdentado = codigoIdentado + value.valor + "\n";

            for(var i = 0; i < qtd; i++){
                codigoIdentado += "\t";
            }
        }
        else if (value.tipo != "QUEBRA DE LINHA"){
            codigoIdentado = codigoIdentado + value.valor;
        }
    });

    $("#codigo").val(codigoIdentado);
}

function erroSintatico(texto, linha) {
    toastr.warning(texto+(linha != '' ? "\nLinha: "+linha : ""), "Erro sintático.");
}