import { ContactList } from '../components/ContactList'
import { ContactDetails } from '../components/ContactDetails'
import { EditContactForm } from '../components/EditContactForm'
import { AddContactForm } from '../components/AddContactForm'
import { Header } from '../components/Header'
import useContacts from '../hooks/useContacts'

export const ContactPage = ({ toggleAddContactForm, showForm }) => {
  const { editingContact, selectedContact } = useContacts()
  return (
    <>
     <Header toggleAddContactForm={toggleAddContactForm} />
    <main className="flex flex-col md:flex-row h-4/6 md:gap-2 md:h-5/6 xl:h-87">
      <div className={`w-full ${selectedContact ? 'md:w-1/3' : 'md:w-full'} h-36 md:h-95 lg:h-full md:flex justify-center`}>
          <ContactList toggleAddContactForm={toggleAddContactForm} />
      </div>
      {selectedContact && (
        <div className="w-full p-2 md:pd-2 mt-6 md:mt-6 md:w-2/3 h-5/6 md:h-95 flex flex-col flex-1 item-center ">
          {editingContact ? <EditContactForm /> : <ContactDetails />}
        </div>
      )}
      <AddContactForm showForm={showForm} onClose={toggleAddContactForm} />
    </main>
    </>
  )
}
