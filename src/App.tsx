import { useState, useEffect } from 'react'
import './App.css'

const base = "http://localhost:3000/recipe/read?"
const qParams = new URLSearchParams(location.search.slice(1))
let timeOutId: number

type Recipe = {
    id: number
    title: string,
    cook_time: number,
    prep_time: number,
    ratings: string,
    cuisine: string,
    category: string,
    author: string,
    image: string,
    ingredients: string[],
    created_at: string,
    updated_at: string,
}

const Card = (props: { recipe: Recipe }) => {
    const recipe = props.recipe

    return <div
        className="max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <div>
            <img className="rounded-t-lg object-cover h-48 w-96" src={ recipe.image } alt={ recipe.title } />
        </div>
        <div className="p-5">
            <p className="mb-2 text-xl font-bold tracking-tight text-gray-900 dark:text-white">{ recipe.title }</p>
            {recipe.ingredients.map((ingredient: string) => (<p key={ingredient} className="mb-1 text-sm font-normal text-gray-700 dark:text-gray-400">{ ingredient }</p>))}
        </div>
    </div>
}

export default function App() {

    const [recipes, setRecipes] = useState([])
    const [query, setQuery] = useState(qParams.get("search_ingredients") || "")
    const [page, setPage] = useState(qParams.get("page") && Number(qParams.get("page")) > 0 ? Number(qParams.get("page")) : 1)
    const [loading, setLoading] = useState(false)

    qParams.set("per_page", "20")
    const fetchData = async (url: string) => {
        setLoading(true)
        history.pushState("", "", location.origin + "?" + qParams.toString())
        try {
            const response = await fetch(url)
            const json = await response.json()
            // Only put the results in state, ie, the actual users array
            setRecipes(json)
            setLoading(false)
        } catch (error) {
            console.error("error", error)
            setLoading(false)
        }
    }

    const debouncedSearch = (query: string) => {
        setQuery(query)
        clearTimeout(timeOutId)
        timeOutId = setTimeout(() => {
            setPage(1)
            qParams.set("page", "1")
            qParams.set("search_ingredients", query)
            fetchData(base + qParams.toString())
        }, 800)
    }

    const onPageChange = (page: number) => {
        setPage(page)
        qParams.set("page", page.toString())
        fetchData(base + qParams.toString())
    }

    useEffect(() => {
        fetchData(base + qParams.toString())
    }, [])

    return (
        <>
            <form className="mx-auto mb-4">
                <label htmlFor="default-search"
                       className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                <div className="relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true"
                             xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                        </svg>
                    </div>
                    <input type="search" id="default-search"
                           className="block outline-none w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                           placeholder="Search by ingredients" required
                           value={query}
                           onChange={event => debouncedSearch(event.target.value)}/>
                    <div role="status" className="absolute end-2.5 bottom-2.5" hidden={ !loading }>
                        <svg aria-hidden="true"
                             className="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
                             viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                fill="currentColor"/>
                            <path
                                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                fill="currentFill"/>
                        </svg>
                        <span className="sr-only">Loading...</span>
                    </div>
                </div>
            </form>
            <div className="flex flex-col-2 mb-2">
                <div>
                    <button type="button" disabled={ page === 1 || loading } onClick={ () => onPageChange(page - 1) }
                            className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-30">
                        &larr; Prev 20
                    </button>
                </div>
                <div className="w-full">
                    <p className="whitespace-nowrap text-gray-500 font-medium text-sm px-5 py-2.5 me-2 mb-2">
                        {(page - 1) * 20} - {recipes.length < 20 ? (page - 1) * 20 + recipes.length : page * 20}
                    </p>

                </div>
                <div>
                    <button type="button" disabled={recipes.length < 20 || loading} onClick={() => onPageChange(page + 1)}
                            className="whitespace-nowrap text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800 disabled:cursor-not-allowed disabled:opacity-30">
                    Next 20 &rarr;
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {recipes.map((recipe: Recipe) => (
                    <Card key={recipe.id} recipe={recipe}/>
                ))}
            </div>
        </>
    )
}
