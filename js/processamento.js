$(document).ready(function() {
    $("#aa").on("click", function () {
        var codigo = $("#codigo").val();
        var quebra = codigo.split(' ');

        alert(quebra[6]);
    });
});