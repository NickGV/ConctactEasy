import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import { ContactsContext } from '../context/ContactsContext'

export const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useContext(ContactsContext)

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value)
  }

  return (
    <div className="w-full md:px-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search contacts"
          onChange={handleSearchChange}
          value={searchTerm}
          className="w-full bg-transparent rounded-md border border-stroke dark:border-dark-3 py-2.5 px-4 text-dark-6 outline-none transition focus:border-white ring-white ring-1 focus:ring-orange-400"
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 px-3 py-2.5 text-gray-500 hover:text-gray-700 focus:outline-none"
        >
          <FontAwesomeIcon icon={faMagnifyingGlass} />
        </button>
      </div>
    </div>
  )
}
