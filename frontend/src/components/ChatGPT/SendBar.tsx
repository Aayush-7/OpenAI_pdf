// import React, { KeyboardEventHandler, useRef } from 'react'

// import { ClearOutlined, SendOutlined } from '@ant-design/icons'

// import { ChatRole, SendBarProps } from './interface'
// import Show from './Show'

// const SendBar = (props: SendBarProps) => {
//   const { loading, disabled, onSend, onClear, onStop } = props

//   const inputRef = useRef<HTMLTextAreaElement>(null)

//   const onInputAutoSize = () => {
//     if (inputRef.current) {
//       inputRef.current.style.height = 'auto'
//       inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
//     }
//   }

//   const handleClear = () => {
//     if (inputRef.current) {
//       inputRef.current.value = ''
//       inputRef.current.style.height = 'auto'
//       onClear()
//     }
//   }

//   const handleSend = () => {
//     const content = inputRef.current?.value
//     if (content) {
//       inputRef.current!.value = ''
//       inputRef.current!.style.height = 'auto'
//       onSend({
//         content,
//         role: ChatRole.User
//       })
//       alert('File created successfully!');
//     }
//   }

//   const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
//     if (e.shiftKey) {
//       return
//     }

//     if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
//       handleSend()
//     }
//   }

//   return (
//     <Show
//       fallback={
//         <div className="thinking">
//           <span>Please wait ...</span>
//           <div className="stop" onClick={onStop}>
//             Stop
//           </div>
//         </div>
//       }
//       loading={loading}
//     >
//       <div className="send-bar">
//         <textarea
//           ref={inputRef!}
//           className="input"
//           disabled={disabled}
//           placeholder="Shift + Enter for new line"
//           autoComplete="off"
//           rows={1}
//           onKeyDown={onKeydown}
//           onInput={onInputAutoSize}
//         />
//         <button className="button" title="Send" disabled={disabled} onClick={handleSend}>
//           <SendOutlined />
//         </button>
//         <button className="button" title="Clear" disabled={disabled} onClick={handleClear}>
//           <ClearOutlined />
//         </button>
//       </div>
//     </Show>
//   )
// }

// export default SendBar

import React, { KeyboardEventHandler, useRef } from 'react'
import { ClearOutlined, SendOutlined } from '@ant-design/icons'
import { ChatRole, SendBarProps } from './interface'
import Show from './Show'

const SendBar = (props: SendBarProps) => {
  const { loading, disabled, onSend, onClear, onStop } = props

  const inputRef = useRef<HTMLTextAreaElement>(null)

  const onInputAutoSize = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto'
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px'
    }
  }

  const handleClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      inputRef.current.style.height = 'auto'
      onClear()
    }
  }

  const handleSend = async () => {
    const content = inputRef.current?.value
    if (content) {
      inputRef.current!.value = ''
      inputRef.current!.style.height = 'auto'
      
      // Make a POST request to the backend API
      try {
        const response = await fetch('http://localhost:5000/generate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
            
          },
          body: JSON.stringify({ query: content })
        })
        
        if (!response.ok) {
          throw new Error('Error generating file')
        }
        
        // Assuming the response contains the PDF file to download
        const blob = await response.blob()
        const pdfUrl = URL.createObjectURL(blob)
        
        // Open the generated PDF in a new tab
        window.open(pdfUrl, '_blank')
      } catch (error) {
        console.error('Error generating file:', error)
      }
    }
  }

  const onKeydown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.shiftKey) {
      return
    }

    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      handleSend()
    }
  }

  return (
    <Show
      fallback={
        <div className="thinking">
          <span>Please wait ...</span>
          <div className="stop" onClick={onStop}>
            Stop
          </div>
        </div>
      }
      loading={loading}
    >
      <div className="send-bar">
        <textarea
          ref={inputRef!}
          className="input"
          disabled={disabled}
          placeholder="Shift + Enter for new line"
          autoComplete="off"
          rows={1}
          onKeyDown={onKeydown}
          onInput={onInputAutoSize}
        />
        <button className="button" title="Send" disabled={disabled} onClick={handleSend}>
          <SendOutlined />
        </button>
        <button className="button" title="Clear" disabled={disabled} onClick={handleClear}>
          <ClearOutlined />
        </button>
      </div>
    </Show>
  )
}

export default SendBar
