const meals = document.getElementById('meals')
const meallist = document.getElementById('fav-meals')
const modifyBtn = document.getElementById("modify")
const body = document.querySelector("body")
const randomBtn = document.querySelector(".random-btn")
const searchTerm = document.getElementById("search-term")
const searchBtn = document.getElementById("search")
const previewerList = document.querySelector(".previewer")
console.log(searchTerm)

searchTerm.value = null
getRandomMeal()
fetchFavMeals()

async function showerror(str) {
    const notice = document.createElement("div")
    notice.classList.add("notice")
    notice.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM8 4a.905.905 0 0 0-.9.995l.35 3.507a.552.552 0 0 0 1.1 0l.35-3.507A.905.905 0 0 0 8 4zm.002 6a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>
    </svg>
    <span>${str}</span>
    `
    body.insertAdjacentElement("afterbegin", notice)

    setTimeout(() => {
        body.removeChild(notice)
    }, 5000)

}

modifyBtn.addEventListener('click', async () => {
    const clearBtn = document.querySelectorAll(".clear") 

    if (clearBtn.length === 0) {
        modifyBtn.classList.remove("ing")
        modifyBtn.innerHTML = `<i class="fas fa-pen"></i>`
        showerror('最愛菜單裡面沒有東西喔！')
        return
    }
    if (modifyBtn.classList.contains("ing")) {
        clearBtn.forEach(item => {
            item.classList.remove("show")
        })
        modifyBtn.classList.remove("ing")
        modifyBtn.innerHTML = `<i class="fas fa-pen"></i>`
    } else {
        clearBtn.forEach(item => {
            item.classList.add("show")
        })
        modifyBtn.classList.add("ing")
        modifyBtn.innerHTML = `完成`
    }
})

randomBtn.addEventListener('click', async () => {
    meals.innerHTML = ``
    getRandomMeal()
})

async function getRandomMeal() {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/random.php')

    const getMealObj = await resp.json()
    const randomMeal = getMealObj.meals[0]

    addMeal(randomMeal, true)
}

async function getMealById(id) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i=' + id)

    const respData = await resp.json()
    const meal = respData.meals[0]

    return meal
}

async function getMealBySearch(term) {
    const resp = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)

    const respData = await resp.json()
    let meal = []

    
    if(respData.meals) {
        respData.meals.forEach(item => {
            const preview = item.strMeal
            showPreview(preview)
        })
    } else {
        showPreview('Empty')
    }

    respData.meals ? meal = respData.meals[0] : meal
    console.log('https://www.themealdb.com/api/json/v1/1/search.php?s=' + term)
    return meal
}


function addMeal(mealData, random = false, status = false) {
    const meal = document.createElement('div')

    meal.classList.add('meal')

    // HTML DISPLAY
    meal.innerHTML = `
    <div class="meal-header">
        ${random ? `<span class="random"> Random Recipe </span>` : `<span class="random"> ${mealData.strMeal} </span>`
        }
        <img src="${mealData.strMealThumb}" alt="${mealData.strMeal}">
    </div>
    <div class="meal-body">
        <h4>${mealData.strMeal}</h4>
        <button class="fav-btn">
            <i class="far fa-heart fa-lg"></i>
        </button>
    </div>
    `

    const favBtn = meal.querySelector('.meal-body .fav-btn')

    
    status ? favBtn.classList.add('active') : favBtn.classList.remove('active')

    favBtn.addEventListener('click', () => {
        if (favBtn.classList.contains('active')) {
            const currentMeal = document.getElementById(mealData.idMeal)
            meallist.removeChild(currentMeal)
            removeMealLS(mealData.idMeal)
            favBtn.classList.remove('active')
        } else {
            addMealFav(mealData)
            addMealLS(mealData.idMeal)
            favBtn.classList.add('active')
        }
        console.log(localStorage)
    })

    meals.appendChild(meal)
}

function addMealLS(mealId) {
    const mealIds = getMealsLS()

    localStorage.setItem('mealIds', JSON.stringify([...mealIds, mealId]))
}

function getMealsLS() {
    const mealIds = JSON.parse(localStorage.getItem('mealIds'))

    return mealIds === null ? [] : mealIds
}

function removeMealLS(mealId) {
    const mealIds = getMealsLS()

    localStorage.setItem('mealIds', JSON.stringify(mealIds.filter(id => id !== mealId)))
}

async function fetchFavMeals() {
    const mealIds = getMealsLS()
    const query = []

    for (i = 0; i < mealIds.length; i++) {
        const mealId = mealIds[i]
        const meal = await getMealById(mealId)
        query.push(addMealFav(meal))
    }

    // console.log(query)
    Promise.all(query)
    // 加到最愛列
}


async function addMealFav(meal) {
    const favMeal = document.createElement('li')
    favMeal.setAttribute('id', meal.idMeal)

    favMeal.innerHTML = `
        <img src="${meal.strMealThumb}"
        alt="${meal.strMeal}">
        <button class="clear"><i class="fas fa-lg fa-window-close"></i></button>
    `
    const removeFavMeal = favMeal.querySelector(".clear")
    const Meal = favMeal.querySelector("img")

    removeFavMeal.addEventListener('click', () => {
        const currentList = document.getElementById(meal.idMeal)
        removeMealLS(meal.idMeal)
        meallist.removeChild(currentList)
        meals.querySelector('.fav-btn').classList.remove ('active')
    })

    Meal.addEventListener('click', async () => {
        const currentMeal = await getMealById(meal.idMeal)
        console.log(currentMeal);
        meals.innerHTML = ""
        addMeal(currentMeal, false, true)
    })

    meallist.appendChild(favMeal)
}

function showPreview(str) {
    const previewer = document.createElement("li")
    previewerList.classList.add("show")
    previewer.innerHTML = `${str}`
    previewerList.appendChild(previewer)

    previewer.addEventListener('click', () => {
        const searchText = previewer.innerText
        searchTerm.value = searchText
    })
}

searchBtn.addEventListener('click', async () => {
    const inputValue = searchTerm.value
    const meal = await getMealBySearch(inputValue)
    if (meal.length === 0) {
       showerror('搜尋無結果！') 
       return
    }
    meals.innerHTML = ``
    addMeal(meal)
})

searchTerm.addEventListener('keydown', async () => {
    const inputValue = searchTerm.value
    previewerList.innerHTML = ``
    getMealBySearch(inputValue)
})

body.addEventListener('click', () => {
    previewerList.classList.remove('show')
    previewerList.innerHTML = ``
})