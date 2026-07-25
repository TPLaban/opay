
"use client";
import React, {useState, useEffect, useCallback} from 'react'
import { CiSearch } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { IoIosCopy } from "react-icons/io";
import { MdEdit } from "react-icons/md";  
import { MdOutlineVisibility, MdOutlineVisibilityOff } from "react-icons/md"
import { IoMdNotificationsOutline } from "react-icons/io";
import Image from 'next/image'
import { SearchParamsContext } from 'next/dist/shared/lib/hooks-client-context.shared-runtime';

function Page() {
  const [transactions, setTransactions] = useState([])
  const [editTransaction, setEditTransaction] = useState(null)



  const [currentTime, setCurrentTime] = useState('')
  const [currentDate, setCurrentDate] = useState('')
  const [visible, setVisible] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

 
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    description: ''
  })
  
  const [editFormData, setEditFormData] = useState({
    amount: '',
    category: '',
    description: ''
  })

  const displayNetworkError = useCallback((message = 'Network error. Please try again.') => {
    setErrorMessage(message)
    console.error(message)
  }, [])

// get a transaction from the backend API
  const normalizeTransactions = (payload) => {
    if (Array.isArray(payload)) return payload
    if (Array.isArray(payload?.transactions)) return payload.transactions
    if (payload && typeof payload === 'object') return [payload]
    return []
  }

  const fetchTransactions = useCallback(async () => {
    try {
      const response = await fetch('https://backend-1-7m4z.onrender.com', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Api-Key': 'e9a3a2b8e2b5eea2cf4947c39021ca317fcbf8fcfe9e672cfca14b784353fb58',
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        displayNetworkError(`Failed to load transactions: ${errorData?.message || response.statusText}`)
        return
      }

      const data = await response.json().catch(() => null)
      const items = normalizeTransactions(data)
      setTransactions(items)
      setErrorMessage('')
    } catch (error) {
      displayNetworkError('Network error while loading transactions. Please try again.')
    }
  }, [displayNetworkError])

    useEffect(() => {
      let isActive = true

      const loadTransactions = async () => {
        await fetchTransactions()
        if (!isActive) return
      }

      loadTransactions()

      return () => {
        isActive = false
      }
    }, [fetchTransactions])



// delete a transaction from the backend API
    const deleteTransaction = async (id) => {
      const shouldDelete = confirm("Are you sure you want to delete this transaction?");
      if (!shouldDelete) {
        return;
      }

      const response = await fetch ('https://backend-1-7m4z.onrender.com', {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key":
          "e9a3a2b8e2b5eea2cf4947c39021ca317fcbf8fcfe9e672cfca14b784353fb58",
        },
        body: JSON.stringify({id})
      })
      
      const data = await response.json().catch(() => null);
      if (response.ok) {
        await fetchTransactions();
        alert("Transaction deleted successfully!");
      } else {
        alert (`Error: ${data.message || "Failed to delete transaction"}`);
      }
    }
// edit a transaction from the backend API
    const handleEditInputChange = (e) => {
      const { name, value } = e.target;
      setEditFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    };
    const startEditing = (transaction) => {
      setEditTransaction(transaction._id);
      setEditFormData({
        amount: transaction.amount.toString(),
        category: transaction.category,
        description: transaction.description
      });
    };
    const cancelEditing = () => {
      setEditTransaction(null);
      setEditFormData({
        amount: '',
        category: '',
        description: ''
      });
    };

// create a transaction and send it to the backend API
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    };



// for one form submission, the form data is sent to the backend API and the transaction is created
    const handleTransactionSubmit = async (e) => {
      e.preventDefault();

      if (
        !formData.amount ||
        !formData.description.trim() ||
        !formData.category
       
      ) {
        alert("Please fill in all fields");
        return;
      }

      try {
        const TransactionToSubmit = {
          ...formData,
          amount: parseFloat(formData.amount) || 0,
        };

        const response = await fetch('https://backend-1-7m4z.onrender.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': 'e9a3a2b8e2b5eea2cf4947c39021ca317fcbf8fcfe9e672cfca14b784353fb58',
          },
          body: JSON.stringify(TransactionToSubmit),
        });

        if (response.ok) {
          const data = await response.json().catch(() => null);
          const createdItems = normalizeTransactions(data);
          if (createdItems.length > 0) {
            setTransactions((prev) => [...prev, ...createdItems]);
          }
          alert("Transaction created successfully!");
          setFormData({
            amount: '',
            category: '',
            description: '',
          });
          await fetchTransactions();
        } else {
          try {
            const errorData = await response.json();
            alert(`Error: ${errorData.message || 'Failed to create transaction'}`);
          } catch {
            alert(`Error: Server returned status ${response.status} ${response.statusText}. Check that the server is running.`);
          }
        }
      } catch (error) {
        console.error('Error creating transaction:', error);
        displayNetworkError('Network error. Please try again.');
      }
    };

  // save edited transaction in back end.
  
  const saveEditedTransaction = async (transactionID) => {
    if (
      !editFormData.amount ||
      !editFormData.description.trim() ||
      !editFormData.category
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const updatedTransaction = {
        ...editFormData,
        amount: Number(editFormData.amount) || 0,
        description: editFormData.description.trim(),
        category: editFormData.category,
        id: transactionID
      };

      const response = await fetch('https://backend-1-7m4z.onrender.com', {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": "e9a3a2b8e2b5eea2cf4947c39021ca317fcbf8fcfe9e672cfca14b784353fb58",
        },
        body: JSON.stringify(updatedTransaction),
      });

      const contentType = response.headers.get('content-type') || '';
      let data = null;
      let bodyText = '';

      if (contentType.includes('application/json')) {
        data = await response.json().catch(() => null);
        bodyText = data ? JSON.stringify(data) : '';
      } else {
        bodyText = await response.text().catch(() => '');
      }

      if (response.ok) {
        if (data?.transaction && typeof data.transaction === 'object') {
          setTransactions((prev) => prev.map((item) => item._id === transactionID ? { ...item, ...data.transaction } : item));
        } else {
          const updatedItems = normalizeTransactions(data);
          if (updatedItems.length > 0) {
            setTransactions(updatedItems);
          } else {
            await fetchTransactions();
          }
        }
        cancelEditing();
        setErrorMessage('');
        alert("Transaction updated successfully!");
      } else {
        const message = data?.message || bodyText || `Server returned ${response.status} ${response.statusText}`;
        displayNetworkError(message);
        alert(`Error: ${message}`);
      }
    } catch (error) {
      console.error("Error updating transaction:", error);
      displayNetworkError("Network error. Please try again.");
    }
  };


// intert current time and date into the page
    useEffect(() => {
      const updateTime = () => {
        setCurrentTime(new Date().toLocaleTimeString())
      }

      updateTime()
      const intervalId = window.setInterval(updateTime, 1000)

      return () => window.clearInterval(intervalId)
    }, [])

    useEffect(() => {
      const updateDate = () => {
        setCurrentDate(new Date ().toLocaleDateString())
      }
      updateDate()   
      const intervalId = window.setInterval(updateDate, 1000)

      return () => window.clearInterval(intervalId)
      }, [])


  const time = new Date().getHours()
  const name = 'Paul'
  const greeting = time < 12
    ? `Good morning ${name}.`
    : time < 18
      ? `Good afternoon ${name}.`
      : `Good night ${name}.`

  // Copy account number to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => console.log("Text copied successfully!"))
      .catch(err => console.error("Failed to copy text: ", err));
  }
 
  return (

    <div className="wrapper">

<div className="contain">

<div className='row-one'>
        <div>
                <Image className='image'
                src="/pic.jpeg"
                alt="Visa logo"
                width={15}
                height={15}
                />
        </div>
        <div id='demo' className="welcome-title" >
        {greeting}
        </div>
        
          <CiSearch className='image' onClick={SearchParamsContext}/>        
        <div>
        <Image className='image'
                src="/camera.png"
                alt="camera"
                width={15}
                height={15}
                />
        </div>
        <div className="notification">
          <IoMdNotificationsOutline className='image' />
        </div>
    </div>
    <div className='date-time'>
      <div id='display-time' className='display-time'>
    Time: {currentTime} 
   </div>

   <div id="display-date" className='display-date'>
    Date: {currentDate}
   </div>
    </div>
   
        <marquee className="scroll-text">Use your assigned virtual account for the fastest wallet credit. /// Manual funding is temporarily available while the transition continues.</marquee>
  

    <div className='card'>
      <div className='card-row1'>
        <div className='amount'>
          <span className='naira'  >N</span>


          {visible
            ? transactions.filter((item) => item.category === "Income").reduce((total, item) => total + item.amount, 0).toLocaleString('en-US')
            : '******'}
            

          <div>
            {visible ? (
              <MdOutlineVisibility onClick={() => setVisible((prev) => !prev)} />
            ) : (
              <MdOutlineVisibilityOff onClick={() => setVisible((prev) => !prev)} />
            )}
          </div>
         

        </div>
        <div className='account-open'>
          Account Open
        </div>
      </div>
      <div className='card-row2'>
        <p>Polaris Save Plus</p>
      </div>
      <div className='card-row3'>
          <div className='account-no'>
            <p>10101626537</p>
            <IoIosCopy className="copy" onClick={() => copyToClipboard("10101626537")}/>      
          </div>
          <div > <a className='hist' href="http:">History </a></div>
      </div>
    </div>
    {errorMessage && (
      <div className="network-error" style={{
        color: '#fff',
        background: 'rgba(220, 53, 69, 0.95)',
        padding: '12px 16px',
        borderRadius: '10px',
        margin: '16px 0',
        maxWidth: '620px',
      }}>
        {errorMessage}
      </div>
    )}

   {/* <table>
      <thead>
        <tr>
          <td>S/No</td>
          <td>Category</td>
          <td>Amount</td>
          <td>Description</td>
        </tr>
      </thead>
       { transactions.map((item) => (
      <tbody key={item._id}>
          <tr>
            <td>{item.serialNo}</td>
             <td>{item.category}</td>
             <td>N{item.amount}</td>
            <td >{item.description}</td> */}
            {/* <td>{new Date(item.createdAt).toLocaleString ('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
              })}
              
            </td> */}
          {/* </tr>
      </tbody>
        ))}

    </table> */}

  <div className='recent-transactions'>
  <p>Recent Transactions</p>

  <form className='transaction-form' onSubmit={handleTransactionSubmit}>
    <label htmlFor="amount" className='amount-label'>Amount:</label>
    <input 
      type="number" 
      id="amount"
      name="amount"
      placeholder="Enter amount" 
      className='transaction-input-amount'
      value={formData.amount}
      onChange={handleInputChange}
    /> 

    <label htmlFor="category" className='select-label'>Category</label> 
    <select
      id="category"
      name="category"
      className='transaction-select-input'
      value={formData.category}
      onChange={handleInputChange}
    >
      <option value="">Select category</option>
      <option value="Income">Income</option>
      <option value="Expense">Expense</option>
    </select> 

    <label htmlFor="description" className='description-label'>Description:</label>
    <input 
      type="text" 
      id="description"
      name="description"
      placeholder="Enter description" 
      className='transaction-input-description'
      value={formData.description}
      onChange={handleInputChange}
    />

    <input type="submit" value="Add Transaction" className='add-btn'/>
  </form>

  <div className='transaction'>
    {transactions.length === 0 ? (
      <div className='empty-state'>No transactions yet.</div>
    ) : (
      transactions.map((item) => (
        <div key={item._id || `${item.description}-${item.amount}`}>
          <div className='individual-transaction' >
            <div className='description'>
              <p className='item1'>{item.description || 'No description'}</p>
              <p className='item2'>{item.category || 'Uncategorized'}</p>
            </div>

            <div className='item3'>
              <p><span className='naira1'>N</span>{Number(item.amount || 0).toLocaleString('en-US')}</p>

              <div className='delete-edit-container'>
                <MdDelete className='delete-icon' onClick={() => deleteTransaction(item._id)} />
                <MdEdit className='edit-icon' onClick={() => startEditing(item)} />
              </div>
            </div>
          </div>

          <div className='edit-function'>
            {editTransaction === item._id && (
              <form className='edit-transaction-form' onSubmit={(e) => {
                e.preventDefault();
                saveEditedTransaction(item._id);
              }}>
                <input 
                  type="number" 
                  name="amount"
                  placeholder="Enter amount" 
                  className='transaction-input-amount'
                  value={editFormData.amount}
                  onChange={handleEditInputChange}
                  style={{marginRight: "30px", width:"120px"}}
                />
                <select
                  name="category"
                  className='transaction-select-input'
                  value={editFormData.category}
                  onChange={handleEditInputChange}
                  style={{ marginLeft: '10px', width: '155px' }}
                >
                  <option value="">Select category</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                </select>
                <input 
                  type="text" 
                  name="description"
                  placeholder="Enter description" 
                  className='transaction-input-description'
                  value={editFormData.description}
                  onChange={handleEditInputChange}
                  style={{ width: '320px' }}
                />

                <button type="submit" className='edit-btn'>Save</button>
                <button type="button" onClick={cancelEditing} className='cancel-btn'>Cancel</button>
              </form>
            )}
          </div>
        </div>
      ))
    )}
  </div>

</div>

 


    <div className="transaction-summary">Transaction Summary
      <div className='total-income-expense'>
          <div > Total Income: <br></br><span className='naira'  >N</span> {transactions.filter(item => item.category === 'Income').reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString('en-US')}</div>
          <div >Total Expense: <br></br><span className='naira'  >N</span> {transactions.filter(item => item.category === 'Expense').reduce((sum, item) => sum + parseFloat(item.amount), 0).toLocaleString('en-US')}</div>
          <div>Balance: <br></br><span className='naira'  >N</span> {(transactions.filter(item => item.category === 'Income').reduce((sum, item) => sum + parseFloat(item.amount), 0) - transactions.filter(item => item.category === 'Expense').reduce((sum, item) => sum + parseFloat(item.amount), 0)).toLocaleString('en-US')}</div>  
      </div>
    </div>
   
    {/* Services */}
    <p className='title-services'>Services</p>
    <div className='services'>
      <div className='airtime'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="brown"><path d="M216-144q-29.7 0-50.85-21.15Q144-186.3 144-216v-600h72v600h600v72H216Zm48-120v-336h144v336H264Zm192 0v-504h144v504H456Zm192 0v-192h144v192H648Z"/></svg>
        </button>
        Airtime
      </div>
       <div className='data'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="brown"><path d="M331-126q-70-30-122.5-82.5T126-331q-30-70-30-149.5t30-149q30-69.5 82.5-122T331-834q70-30 149.5-30t149 30q69.5 30 122 82.5t82.5 122q30 69.5 30 149T834-331q-30 70-82.5 122.5t-122 82.5q-69.5 30-149 30T331-126Zm149-45q17-17 34-63.5T540-336H420q9 55 26 101.5t34 63.5Zm-91-10q-14-30-24.5-69T347-336H204q29 57 77 97.5T389-181Zm182 0q60-17 108-57.5t77-97.5H613q-7 47-17.5 86T571-181ZM177-408h161q-2-19-2.5-37.5T335-482q0-18 .5-35.5T338-552H177q-5 19-7 36.5t-2 35.5q0 18 2 35.5t7 36.5Zm234 0h138q2-20 2.5-37.5t.5-34.5q0-17-.5-35t-2.5-37H411q-2 19-2.5 37t-.5 35q0 17 .5 35t2.5 37Zm211 0h161q5-19 7-36.5t2-35.5q0-18-2-36t-7-36H622q2 19 2.5 37.5t.5 36.5q0 18-.5 35.5T622-408Zm-9-216h143q-29-57-77-97.5T571-779q14 30 24.5 69t17.5 86Zm-193 0h120q-9-55-26-101.5T480-789q-17 17-34 63.5T420-624Zm-216 0h143q7-47 17.5-86t24.5-69q-60 17-108 57.5T204-624Z"/></svg>
        </button>
        Data
      </div>
         <div className='transfer'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="brown"><path d="M288-144 96-336l192-192 51 51-105 105h582v72H234l105 105-51 51Zm384-288-51-51 105-105H144v-72h582L621-765l51-51 192 192-192 192Z"/></svg>        </button>
        Transfer
      </div>
        <div className='marketplace'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="25px" viewBox="0 -960 960 960" width="25px" fill="brown"><path d="M213-117.21q-21-21.21-21-51T213.21-219q21.21-21 51-21T315-218.79q21 21.21 21 51T314.79-117q-21.21 21-51 21T213-117.21Zm432 0q-21-21.21-21-51T645.21-219q21.21-21 51-21T747-218.79q21 21.21 21 51T746.79-117q-21.21 21-51 21T645-117.21ZM253-696l83 192h301l82-192H253Zm-31-72h570q14 0 20.5 11t1.5 23L702.63-476.14Q694-456 676.5-444T637-432H317l-42 72h493v72H276q-43 0-63.5-36.15-20.5-36.16.5-71.85l52-90-131-306H48v-72h133l41 96Zm114 264h301-301Z"/></svg>
        </button>
        Market Place
      </div>
          
    </div>
<br></br>
<div className='services'>
      <div className='airtime'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="brown"><path d="M240-170Q136-197 68-282T0-480q0-113 68-198t172-112v84q-71 24-115.5 86T80-480q0 78 44.5 140T240-254v84Zm320 10q-133 0-226.5-93.5T240-480q0-133 93.5-226.5T560-800q66 0 124 25t102 69l-56 56q-33-33-76.5-51.5T560-720q-100 0-170 70t-70 170q0 100 70 170t170 70q50 0 93.5-18.5T730-310l56 56q-44 44-102 69t-124 25Zm240-160-56-56 64-64H520v-80h288l-64-64 56-56 160 160-160 160Z"/></svg>
        </button>
        Remitta
      </div>
       <div className='data'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="brown"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-40-83v-40q-35-5-67.5-19T312-256l-28 29q33 26 72.5 42.5T440-163Zm80 0q44-5 83.5-21.5T676-227l-28-29q-28 20-60.5 34T520-203v40Zm-40-117q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm253-4q26-33 42.5-72.5T797-440h-40q-5 35-19 67.5T704-312l29 28Zm-506 0 29-29q-20-28-34-60t-19-67h-40q5 44 21.5 83.5T227-284Zm253-36L360-480l120-160 120 160-120 160ZM163-520h40q5-35 19-67t34-60l-29-29q-26 33-42.5 72.5T163-520Zm594 0h40q-5-44-22-83.5T732-676l-28 28q20 28 34 60.5t19 67.5ZM313-704q28-20 60-34t67-19v-40q-44 5-83.5 21.5T284-733l29 29Zm335 0 28-28q-33-26-72.5-43T520-797v40q35 5 67.5 19t60.5 34Z"/></svg>
        </button>
        Betting
      </div>
         <div className='transfer'>
         <button className='btn'>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="brown"><path d="M880-720v480q0 33-23.5 56.5T800-160H160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720Zm-720 80h640v-80H160v80Zm0 160v240h640v-240H160Zm0 240v-480 480Z"/></svg> </button>
        Card
      </div>
        <div className='marketplace'>
         <button className='btn'>
<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="brown"><path d="M480-160q-33 0-56.5-23.5T400-240q0-33 23.5-56.5T480-320q33 0 56.5 23.5T560-240q0 33-23.5 56.5T480-160Zm0-240q-33 0-56.5-23.5T400-480q0-33 23.5-56.5T480-560q33 0 56.5 23.5T560-480q0 33-23.5 56.5T480-400Zm0-240q-33 0-56.5-23.5T400-720q0-33 23.5-56.5T480-800q33 0 56.5 23.5T560-720q0 33-23.5 56.5T480-640Z"/></svg>        </button>
        More
      </div>
          
    </div>
</div>
   
    </div>
    
  )
}
 
export default Page