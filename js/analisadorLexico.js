//Objeto para os Tokens
function Token(tipo, valor, valido) {
    this.tipo = tipo;
    this.valor = valor;
    this.valido = valido;
}

var tokensGlobais = [];

//Função geral, responsavel pelo começo da validação do código
function analisar() {
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
        if (caracter >= 48 && caracter <= 57)
        {
            token = validarTokenNumerico(caracteres);
        }

        //Texto
        else if (caracter == 34)
        {
            token = validarTokenTexto(caracteres);
        }

        //Identificador
        else if ((caracter == 60) || (caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122))
        {
            token = validarTokenIdentificador(caracteres);
        }

        //Caracteres descartados
        else if (caracter == 32)
        {
            token = new Token("ESPAÇO", caracterO, true);
        }
        else if (caracter == 10)
        {
            token = new Token("QUEBRA DE LINHA", caracterO, true);
        }

        for(i = 0; i < token.valor.length; i++)
            caracteres.shift();

        tokensGlobais.push(token);
    }

    console.log(tokensGlobais);
}

function validarTokenNumerico() {
    
}

function validarTokenTexto() {

}

function validarTokenIdentificador(caracteres) {
    var token = new Token("INDENTIFICADOR", "", "");
    //PalavraReservada pr = new PalavraReservada();
    var caracter = caracteres[0].charCodeAt(0);

    if((caracter == 60) || (caracter == 62) || (caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122)){
        token.valor = caracteres[0];
        for (i = 1; i < caracteres.length; i++)
        {
            caracter = caracteres[i].charCodeAt(0);
            if ((caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122) || (caracter >= 48 && caracter <= 57) || caracter == 95 || caracter == 63)
            {
                token.valor = token.valor + caracteres[i];
            }
            else break;
        }
        token.valido = true;
    }
    else{
        token.valido = false;
    }

    return token;
}