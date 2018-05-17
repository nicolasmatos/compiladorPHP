$(document).ready(function(){
    function placeCaretAtEnd(el) {
        el.focus();
        if (typeof window.getSelection != "undefined"
            && typeof document.createRange != "undefined") {
            var range = document.createRange();
            range.selectNodeContents(el);
            range.collapse(false);
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        } else if (typeof document.body.createTextRange != "undefined") {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(el);
            textRange.collapse(false);
            textRange.select();
        }
    }

    //palavras que se pretende substituir e a classe com o estilo para essas palavras
    const sintaxe = [
        {
            palavra: "<?php",
            classe: "tipo"
        },
        {
            palavra: "?>",
            classe: "tipo"
        },
        {
            palavra: "if",
            classe: "base"
        }
    ];


    $("#editor").on("keyup", function () { //aplicar a troca para cada tecla digitada -> $("#codigo2").on("", function () {

        var cnt = $("#editor").html();

        $.each(sintaxe, function( key, s ) { //para cada palavra aplicar a substituição no editor
            //fazer o troca da palavra por um span com mesma palavra e a classe certa
            //alert(s.palavra);
            cnt = cnt.replace(s.palavra, '<span class="'+s.classe+'">'+s.palavra+'</span>');

        });
        //alert(cnt);
        $("#editor").html(cnt); //colocar o texto substituido de volta

        //colocar o cursor no fim de novo
        placeCaretAtEnd(document.getElementById("editor"));
    });
});