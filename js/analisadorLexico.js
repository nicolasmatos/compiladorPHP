//Objeto para os Tokens
function Token(tipo, valor, valido) {
    this.tipo = tipo;
    this.valor = valor;
    this.valido = valido;
}

var palavrasReservadas = ['__halt_compiler', 'abstract', 'and', 'array', 'as', 'break', 'callable', 'case', 'catch', 'class', 'clone', 'const', 'continue', 'declare', 'default', 'die', 'do', 'echo', 'else', 'elseif', 'empty', 'enddeclare', 'endfor', 'endforeach', 'endif', 'endswitch', 'endwhile', 'eval', 'exit', 'extends', 'final', 'for', 'foreach', 'function', 'global', 'goto', 'if', 'implements', 'include', 'include_once', 'instanceof', 'insteadof', 'interface', 'isset', 'list', 'namespace', 'new', 'or', 'print', 'private', 'protected', 'public', 'require', 'require_once', 'return', 'static', 'switch', 'throw', 'trait', 'try', 'unset', 'use', 'var', 'while', 'xor'];

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
        if (caracter >= 48 && caracter <= 57) {
            token = validarTokenNumerico(caracteres);
        }

        //String
        else if (caracter == 34) {
            token = validarTokenString(caracteres);
        }

        //Identificador
        else if ((caracter == 60) || (caracter >= 65 && caracter <= 90) || (caracter >= 97 && caracter <= 122)) {
            token = validarTokenIdentificador(caracteres);
        }

        //Caracteres descartados
        else if (caracter == 32) {
            token = new Token("ESPAÇO", caracterO, true);
        }

        else if (caracter == 10) {
            token = new Token("QUEBRA DE LINHA", caracterO, true);
        }

        console.log(token);
        for(i = 0; i < token.valor.length; i++) {
            caracteres.shift();
        }

        tokensGlobais.push(token);
    }

    console.log(tokensGlobais);
}

function validarTokenNumerico(caracteres) {

}

function validarTokenString(caracteres) {
    var token = new Token("STRING", "", true);
    var fechamento = false;

    if (caracteres[0] == '\"')
    {
        for (i = 1; i < caracteres.length; i++)
        {
            if (token.valido)
            {
                if (caracteres[i] == '\n')
                {
                    token.valor += caracteres[i];
                    token.valido = false;
                }else if (caracteres[i] != '\"')
                {
                    token.valor += caracteres[i];
                }
                else
                {
                    token.valor = "\"" + token.valor + "\"";
                    fechamento = true;
                    break;
                }
            }
            else
            {
                break;
            }
        }

        if (!fechamento)
        {
            token.valido = false;
        }
    }
    return token;
}

function validarTokenIdentificador(caracteres) {
    var token = new Token("INDENTIFICADOR", "", true);
    
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