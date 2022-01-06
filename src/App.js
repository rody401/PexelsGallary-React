import { useState, useEffect } from 'react'
import pexelsApi from './api/pexelsApi'
import header from './images/header.png'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Button } from 'react-bootstrap'


const App = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextPage, setNextPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [query, setQuery] = useState('');


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
      <div className='navtop'>
        <img className='nav' src={header} alt="icon" />
      </div>

      <div className='bar'>
        <form type='submit' onSubmit={search} >
          <input className='input' type='text' require='required' placeholder='Search Images' onChange={(event) => setQuery(event.target.value)} />
          <button className='search' onClick={search} type='button' >Search</button>
        </form>
      </div>

      <div className='image-grid'>
        {images.map((image) => <Card className='img-box' style={{ width: '18rem' }}>
          <Card.Img variant="top" className='img' key={image.id} src={image.src.original} />
          <Card.Body className='card'>
            <Card.Title className='alt'>{image.alt}</Card.Title>
            <Button className='author-button' key={image.photographer_id} href={image.photographer_url} variant="primary">{image.photographer}</Button>
          </Card.Body>
        </Card>)}
      </div>

      <div>
        {nextPage && <Button variant="danger" className='load' onClick={handleLoadMoreClick}>Load More Photos</Button>}
      </div>
    </>
  )
};

export default App
