const checksDifficult = document.querySelectorAll('.form-check');
checksDifficult.forEach((element) => {
    element.addEventListener("click", () => {
        const input = element.querySelector('input[type="radio"]');
        input.checked = true;
    });
});