$(document).ready(function() {
    $("#aa").on("click", function () {
        var codigo = $("#codigo").val();
        var quebra = codigo.split('');
        processa(quebra);
    });

});

function processa(quebra) {
    var tokens = [];
    var i = 0;
    var j = 0;
    while (i != quebra.length){
        if(quebra[i] != "\n") {
            if (i == 0) {
                tokens[j] = quebra[i];
                i++;
            }

            else {
                tokens[j] = tokens[j] + quebra[i];
                i++;
            }
        }

        else{
            j++;
            i++;
        }
    }

    alert(tokens);

    tokens.push("oi");
    alert(tokens);

}
