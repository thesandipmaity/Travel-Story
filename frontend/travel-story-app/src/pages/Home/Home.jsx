import React, { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import { data, useNavigate } from 'react-router-dom'; // Fixed import of useNavigate
import axiosInstance from '../../utils/axiosInstance';
import TravelStoryCard from '../../components/Cards/TravelStoryCard';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdAdd } from 'react-icons/md';
import Modal from 'react-modal';
import AddEditTravelStory from './AddEditTravelStory';
import ViewTravelStory from './ViewTravelStory';
import EmptyCard from '../../components/Cards/EmptyCard';
import { Day, DayPicker } from 'react-day-picker';
import moment from 'moment';
import FilterInfoTitle from '../../components/Cards/FilterInfoTitle';
import { getEmptyCardMessage } from '../../utils/helper';


const Home = () => {
  const navigate = useNavigate(); // Correctly invoked useNavigate (Fix #1)
  const [userInfo, setUserInfo] = useState(null);
  const [allStories, setAllStories] = useState([]);

  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('')

  const [dateRange, setDateRange] = useState({ form: null, to: null })

  const [openAddEditModel, setOpenAddEditModel] = useState({
    isShown: false,
    type: 'add',
    data: null,
  });

  const [openViewModal, setOpenViewModal] = useState({
    isShown: false,
    data: null,
  });

  // Get User Info
  const getUserInfo = async () => {
    try {
      const response = await axiosInstance.get('/get-user');
      if (response.data && response.data.user) {
        setUserInfo(response.data.user);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.clear();
        navigate('/login'); // Fixed navigate usage (Fix #1)
      }
    }
  };

  // Get all travel stories
  const getAllTravelStories = async () => {
    try {
      const response = await axiosInstance.get('/get-all-stories'); // Removed extra '.' in the URL (Fix #2)
      if (response.data && response.data.stories) {
        setAllStories(response.data.stories);
      }
    } catch (error) {
      console.error('An unexpected error occurred. Please try again.');
    }
  };

  // Handle Edit Travel Story
  const handleEdit = (data) => {
    setOpenAddEditModel({ isShown: true, type: 'edit', data: data });
  };

  // Handle Travel Story Click
  const handleViewStory = (data) => {
    setOpenViewModal({ isShown: true, data }); // Fixed data passing (Fix #3)
  };

  // Handle Update Favourite
  const updateIsFavourite = async (storyData) => {
    const storyId = storyData._id;

    try {
      const response = await axiosInstance.put(`/update-is-favourite/${storyId}`, {
        isFavourite: !storyData.isFavourite,
      });

      if (response.data && response.data.story) {
        toast.success('Story Updated Successfully')
        if (filterType === 'search' && searchQuery) {
          onSearchStory(searchQuery)
        } else if (filterType === 'delete') {
          filterStoriesByDate(dateRange)
        } else {
        getAllTravelStories();
        }
      }
    } catch (error) {
      console.error('An unexpected error occurred. Please try again.');
    }
  };

  // Delete Story
  const deleteTravelStory = async (data) => {
    const storyId = data._id

    try{
      const response = await axiosInstance.delete('/delete-story/' + storyId)

      if (response.data && !response.data.error) {
        toast.error('Story Deleted Successfully')
        setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
        getAllTravelStories()
      }
    } catch (error) {
        // Handle unexpected errors
        console.log('An unexpected error occoured. Please try again later')
      }
  }

  // Search Story
  const onSearchStory = async (query) => {
    try {
      const response = await axiosInstance.get('/search', { params: { query } });
      if (response.data && response.data.stories.length > 0) {
        setFilterType('search');
        setAllStories(response.data.stories);
      } else {
        toast.info('No matching stories found.');
        // Do not clear allStories if no matches are found
      }
    } catch (error) {
      console.error('Search failed:', error);
      toast.error('An error occurred. Please try again.');
    }
  };
  
  

  const handleClearSearch = () => {
    setFilterType('')
    getAllTravelStories()
  }

  // Handle Filter Travel Story by Date Range
  const filterStoriesByDate = async (day) => {
    try {
      const startDate = day.from ? moment(day.from).valueOf() : null
      const endDate = day.to ? moment(day.to).valueOf() : null

      if (startDate && endDate) {
        const response = await axiosInstance.get('/travel-stories/filter', {
          params: { startDate, endDate }
        })

        if (response.data && response.data.stories) {
          setFilterType('date')
          setAllStories(response.data.stories)
        }
      }
    } catch (error) {
      console.log('An unexpected error occured. Please try again.')
    }
  }

  // Handle Date Range Select 
  const handleDayClick = (day) => {
    setDateRange(day)
    filterStoriesByDate(day)
  }

  const resetFilter = () => {
    setDateRange({ from: null, to: null })
    setFilterType('')
    filterStoriesByDate()
  }
  
  

  useEffect(() => {
    getAllTravelStories();
    getUserInfo();
  }, []);

  return (
    <>
      <Navbar 
        userInfo={userInfo} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery}
        onSearchNote={onSearchStory} 
        handleClearSearch={handleClearSearch}
      />

      <div className="container mx-auto py-10">
        <FilterInfoTitle
          filterType={filterType}
          filterDates={dateRange}
          onClear={() => {
            resetFilter()
          }}
        />
        <div className="flex gap-7">
          <div className="flex-1">
            {allStories.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {allStories.map((item) => (
                  <TravelStoryCard
                    key={item._id}
                    imageUrl={item.imageUrl}
                    title={item.title}
                    story={item.story}
                    date={item.visitedDate}
                    visitedLocation={item.visitedLocation}
                    isFavourite={item.isFavourite}
                    onEdit={() => handleEdit(item)}
                    onClick={() => handleViewStory(item)} // Fixed parameter passing (Fix #3)
                    onFavouriteClick={() => updateIsFavourite(item)}
                  />
                ))}
              </div>
            ) : (
              <EmptyCard 
                /*imgSrc={EmptyImg}*/
                message={getEmptyCardMessage(filterType)}
              />
            )}
          </div>
          <div className='w-[350px]'>
            <div className='bg-white border-slate-200 shadow-lg shadow-slate-200/60 rounded-lg'>
              <div className='p-3'>
              <DayPicker
                captionLayout='dropdown-buttons'
                mode='range'
                selected={dateRange} // This will now properly represent the selected range
                onSelect={handleDayClick}
                pagedNavigation
              />

              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add & Edit Travel Story Model */}
      <Modal
        isOpen={openAddEditModel.isShown}
        onRequestClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })} // Fixed modal close functionality (Fix #4)
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 999 },
        }}
        appElement={document.getElementById('root')}
        className="model-box"
      >
        <AddEditTravelStory
          type={openAddEditModel.type}
          storyInfo={openAddEditModel.data}
          onClose={() => setOpenAddEditModel({ isShown: false, type: 'add', data: null })}
          getAllTravelStories={getAllTravelStories}
        />
      </Modal>

      {/* View Travel Story Model */}
      <Modal
        isOpen={openViewModal.isShown}
        onRequestClose={() => setOpenViewModal({ isShown: false, data: null })} // Fixed modal close functionality (Fix #4)
        style={{
          overlay: { backgroundColor: 'rgba(0, 0, 0, 0.2)', zIndex: 999 },
        }}
        appElement={document.getElementById('root')}
        className="model-box"
      >
        <ViewTravelStory 
          storyInfo={openViewModal.data || null} 
          onClose={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
          }}
          onEditClick={() => {
            setOpenViewModal((prevState) => ({ ...prevState, isShown: false }))
            handleEdit(openViewModal.data || null)
          }}
          onDeleteClick={() => {
            deleteTravelStory(openViewModal.data || null)
          }}
        />
      </Modal>

      <button
        className="w-16 h-16 flex items-center justify-center rounded-full bg-primary hover:bg-cyan-400 fixed right-10 bottom-10"
        onClick={() => setOpenAddEditModel({ isShown: true, type: 'add', data: null })}
      >
        <MdAdd className="text-[32px] text-white" />
      </button>

      <ToastContainer />
    </>
  );
};

export default Home;
