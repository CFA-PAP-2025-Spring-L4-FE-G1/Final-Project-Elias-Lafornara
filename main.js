const form = document.querySelector(".search")
const searchBar = document.querySelector("#searchbar")
const main = document.querySelector("main")
// https://archive.readme.io/reference/creating-an-item
let page = 1;
let currentQuery = "";

async function search() {
    if (currentQuery != "") {
        main.innerHTML = "";
        let url = "https://archive.org/advancedsearch.php?q=";
        url += currentQuery + "&output=json&rows=50&page=" + page;
        console.log(url)
        let results = fetch(url);
        results = await results;
        results = await results.json();
        results = results.response.docs;
        console.log(results);
        
        displaySearchResults(results)

        makePageChanger()
    }
}

function displaySearchResults(results) {
    for (let result of results) {
        let div = document.createElement("div");
        let title = document.createElement("a");
        let description = document.createElement("p");
        
        div.classList.add("card");
        div.id = result.identifier;
        title.classList.add("title");
        title.href = "https://archive.org/details/" + result.identifier;
        title.target = "about:blank"
        description.classList.add("description");

        title.textContent = result.title;
        description.textContent = result.description;

        div.addEventListener('click', (event) => {
            console.log(event.target)
            if (event.target.className != "title") {
                div.id == "clicked" ? div.id = "" : div.id = "clicked";
            }
        });

        div.append(title);
        div.append(description);
        main.append(div);
        
    }
}

function makePageChanger() {
    let pageChangerContainer = document.createElement("div");
    pageChangerContainer.id = "changePageForm";
    if (page > 1) {
        let backButton = document.createElement("button");
        backButton.id = "backButton";
        backButton.textContent = "Back";
        backButton.addEventListener('click', () => changePage(-1));
        pageChangerContainer.append(backButton);
    }
    if (page < 9999) {
        let nextButton = document.createElement("button");
        nextButton.id = "nextButton";
        nextButton.textContent = "Next";
        nextButton.addEventListener('click', () => changePage(1));
        pageChangerContainer.append(nextButton);
    }
    
    main.append(pageChangerContainer);
}

function changePage(amount) { // amount should be the number of pages to move forwards or backwards
    page += amount;
    search();
}

form.addEventListener("submit", (event) => {
    event.preventDefault();
    currentQuery = searchBar.value;
    currentQuery = currentQuery.replaceAll(" ", "+");
    search()
});
