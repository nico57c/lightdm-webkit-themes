
function createSelectBox(items, selectedItem, callbackOnItemSelection) {

    let mainDiv = document.createElement("div");
    mainDiv.setAttribute("class", "selectbox");

    let selectDiv = document.createElement("div");
    selectDiv.classList.add("select-active");

    let iconDiv = document.createElement("div");
    iconDiv.classList.add("select-icon");

    let selectDivText = document.createElement("span");
    selectDivText.innerHTML = selectedItem.name;

    selectDiv.appendChild(iconDiv);
    selectDiv.appendChild(selectDivText);

    mainDiv.append(selectDiv);

    let optionsDiv = document.createElement("div");
    optionsDiv.classList.add("select-items", "select-hide");
    mainDiv.append(optionsDiv);

    items.forEach(item => {
        let optionDiv = document.createElement("div");
        optionDiv.innerHTML = item.name;
        optionDiv.setAttribute("data-key", item.key);

        optionDiv.addEventListener("click", function(e) {
            Array.from(this.parentNode.getElementsByClassName("selected"))
                .forEach(_ => _.classList.remove("selected"));

            this.classList.add("selected");
            this.parentElement.parentElement.querySelector(".select-active > span").innerHTML = this.innerHTML;
            callbackOnItemSelection({ name: this.innerHTML, key: this.getAttribute("data-key") });
        });
        optionsDiv.appendChild(optionDiv);
    });

    selectDiv.addEventListener("click", function(e) {
        e.stopPropagation();
        if(this.parentElement.getElementsByClassName("select-items")[0].classList.toggle("select-hide")){
            this.getElementsByClassName('select-icon')[0].classList.remove("select-icon-up");
            this.getElementsByClassName('select-icon')[0].classList.add("select-icon-down")
        } else {
            this.getElementsByClassName('select-icon')[0].classList.remove("select-icon-down");
            this.getElementsByClassName('select-icon')[0].classList.add("select-icon-up")
        }

    });

    document.addEventListener("click", function() {
        const element = mainDiv.getElementsByClassName("select-items")[0];
        if(!element.classList.contains("select-hide")) {
            selectDiv.click();
        }
    });

    return mainDiv;
}