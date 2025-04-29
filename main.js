const form = document.querySelector(".search")
const searchBar = document.querySelector("#searchbar")
const main = document.querySelector("main")
// https://archive.readme.io/reference/creating-an-item
let page = 1;

async function search(query) {
    main.innerHTML = "";
    let url = "https://archive.org/advancedsearch.php?q=";
    query = query.replaceAll(" ", "+");
    url += query + "&output=json&page=" + page;
    console.log(url)
    let results = fetch(url);
    results = await results;
    results = await results.json();
    console.log(results.response.docs);
    results = results.response.docs;
    for (let result of results) {
        let div = document.createElement("div");
        let title = document.createElement("h4");
        let description = document.createElement("p");
        
        div.classList.add("card");
        title.classList.add("title");
        description.classList.add("description");

        title.textContent = result.title;
        description.textContent = result.description;

        div.addEventListener('click', () => {
            div.id == "clicked" ? div.id = "" : div.id = "clicked";
        });

        div.append(title);
        div.append(description);
        main.append(div);
        
    }
    let changePageForm = document.createElement("div");
    changePageForm.id = "changePageForm";
    if (page != 1) {
        let backButton = document.createElement("button");
        backButton.id = "backButton";
        backButton.textContent = "Back";
        backButton.addEventListener('click', () => {
            page--;
            search(query);
        });
        changePageForm.append(backButton);
    }
    if (page < 9999) {
        let nextButton = document.createElement("button");
        nextButton.id = "nextButton";
        nextButton.textContent = "Next";
        nextButton.addEventListener('click', () => {
            page++;
            console.log(query)
            search(query);
        });
        changePageForm.append(nextButton);
    }
    
    main.append(changePageForm);
}


form.addEventListener("submit", (event) => {
    event.preventDefault();
    search(searchBar.value)
});
