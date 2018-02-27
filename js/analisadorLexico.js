//Objeto para os Tokens
function Token(tipo, valor, valido) {
    this.tipo = tipo;
    this.valor = valor;
    this.valido = valido;
}

//Instanciandoo um Token
v1 = new Token(1, "Numerico", true);
v2 = new Token(2, "Identificador", true);

var tokensGlobais = [];

tokensGlobais.push(v1);
tokensGlobais.push(v2);

console.log(tokensGlobais);

//Função geral, responsavel pelo começo da validação do código
function analisar() {
    var codigo = $("#codigo").val();
    var quebra = codigo.split('');

    var tokens = [];

    $.each(quebra, function( index, value ){
        //alert(value.charCodeAt(0));
        tokens.push(value.charCodeAt(0));
    });
    console.log(tokens);
}