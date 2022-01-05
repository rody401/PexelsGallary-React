import { useState, useEffect } from 'react'
import pexelsApi from './api/pexelsApi'
import './App.css'


const App = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');


  // Helper functions
  const getCuratedImages = () =>
    pexelsApi.get("/v1/curated", {
      params: {
        page: nextPage,
        per_page: perPage
      }
    }).then(r => r.data.photos)

  const getSearchImages = (page = nextPage) =>
    pexelsApi.get("/v1/search", {
      params: {
        query,
        page,
        per_page: perPage
      }
    }).then(r => r.data.photos)


  // initial render effect
  useEffect(() => {
    setLoading(true)
    getCuratedImages().then(photos => {
      setImages(photos)
      console.log(photos)
      setLoading(false)
    })
  }, [])

  // search onClick handler
  const search = async () => {
    setNextPage(1)
    setLoading(true)
    setImages(await getSearchImages(1)) // directly load page 1
    setLoading(false)
  }

  // handle pagination parameter changes
  useEffect(() => {
    // only action for subsequent pages
    if (nextPage > 1) {
      setLoading(true)

      const promise = query
        ? getSearchImages()
        : getCuratedImages()

      promise.then(photos => {
        setImages([...images, ...photos])
        setLoading(false)
      })
    }
  }, [nextPage])

  const handleLoadMoreClick = () => setNextPage(nextPage + 1)

  if (!images) {
    return <div>Loading</div>
  }

  return (
    <>
      <h1>Pexels Gallary</h1>
      <div className='bar'>
        <form type='submit' onSubmit={search} >
          <input className='input' type='text' require='required' placeholder='Search Images' onChange={(event) => setQuery(event.target.value)} />
          <button className='search' onClick={search} type='button' >Search</button>
        </form>
      </div>

      <div className='image-grid'>
        {images.map((image) => <div className='container'><img key={image.id} src={image.src.original} alt={image.alt} /><p key={image.photographer.id} >Photographer: {image.photographer}</p></div>)}
      </div>

      <div className='load'>
        {nextPage && <button onClick={handleLoadMoreClick}>Load More Photos</button>}
      </div>
    </>
  )
};

export default App
