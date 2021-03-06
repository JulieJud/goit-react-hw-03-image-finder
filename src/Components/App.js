import { Component } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import SearchBar from './Searchbar/Searchbar';
import fetchImages from '../services/imagesApi';
import ImageGallery from './ImageGallery/ImageGallery';
import ButtonLoadMore from './Button/Button';
import Spinner from './Loader/Loader';
import Modal from './Modal/Modal';

export class App extends Component {
  state = {
    imageName: null,
    images: [],
    status: 'idle',
    page: 1,
    error: null,
    largeImageURL: '',
    imgTags: '',
  };

  handleFormSubmit = imageName => {
    this.setState({ imageName, page: 1, images: [] });
  };

  handleLoadMore = () => {
    this.setState(p => ({ page: p.page + 1 }));
  };

  async componentDidUpdate(_, prevState) {
    const { imageName, page } = this.state;

    if (prevState.imageName !== imageName || prevState.page !== page) {
      try {
        this.setState({ status: 'pending' });
        const images = await fetchImages(imageName, page);

        this.setState({ status: 'resolved' });

        if (imageName.trim() === '' || images.length === 0) {
          return toast.error(`no picture with name ${imageName}`);
        }

        this.setState({
          images: [...this.state.images, ...images],
        });

        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
      } catch (error) {
        this.setState({ status: 'rejected' });
        return toast.error('smt going wrong');
      } finally {
        this.setState({ loader: false });
      }
    }
  }

  handleSelectedImage = (largeImageURL, imgTags) => {
    this.setState({ largeImageURL, imgTags });
  };

  closeModal = () => {
    this.setState({ largeImageURL: '' });
  };

  render() {
    const { images, status, largeImageURL, imgTags } = this.state;
    return (
      <div>
        <SearchBar onSearch={this.handleFormSubmit} />
        {images.length < 1 && (
          <>
            <h2 className="titleName">
              The gallery is empty! Use search field!
            </h2>
          </>
        )}

        <ImageGallery
          images={images}
          handleSelectedImage={this.handleSelectedImage}
        />
        {status === 'pending' && <Spinner />}

        {images.length !== 0 && (
          <ButtonLoadMore onClick={this.handleLoadMore} />
        )}

        <Toaster />
        {largeImageURL && (
          <Modal
            onClose={this.closeModal}
            largeImageURL={largeImageURL}
            imgTags={imgTags}
          />
        )}
      </div>
    );
  }
}

export default App;
