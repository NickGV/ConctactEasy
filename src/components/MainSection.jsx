import { useContext } from 'react'
import { ContactDetails } from './ContactDetails'
import { ContactList } from './ContactList'
import { ContactsContext } from '../context/ContactsContext'
import { EditContactForm } from './EditContactForm'
import { Favorites } from './Favorites'

export const MainSection = ({ tab, toggleAddContactForm, handleTabChange }) => {
  const { editingContact, resetSelectedContact } = useContext(ContactsContext)

  const handleTabChangeWithReset = (tab) => {
    resetSelectedContact()
    handleTabChange(tab)
  }

  return (
    <main className="flex flex-col md:flex-row h-4/6 md:gap-2 md:h-5/6 xl:h-87">
      <div className="w-full h-36 md:h-95 lg:h-full  md:w-30 md:flex ">
        {tab === 'contacts' && (
          <ContactList toggleAddContactForm={toggleAddContactForm} />
        )}
        {tab === 'favorites' && (
          <Favorites
            handleTabChange={handleTabChangeWithReset} // Usamos la versión con el reset
            toggleAddContactForm={toggleAddContactForm}
          />
        )}
      </div>
      <div className="w-full h-5/6 md:h-95 lg:h-full  md:w-2/3 flex flex-col flex-1 item-center">
        {editingContact ? <EditContactForm /> : <ContactDetails />}
      </div>
    </main>
  )
}
