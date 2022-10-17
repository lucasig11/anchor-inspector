import React, { useEffect, useRef } from "react"
import { Input as StyledInput } from "theme-ui"
import { useField } from "@unform/core"

const Input = ({ name, ...rest }) => {
  const inputRef = useRef()
  const { fieldName, registerField } = useField(name)

  useEffect(() => {
    registerField({
      name: fieldName,
      ref: inputRef,
      getValue: (ref) => ref.current?.value,
      setValue: (ref, value) => {
        ref.current.value = value
      },
      clearValue: (ref) => {
        ref.current.value = ""
      },
    })
  }, [fieldName, registerField])

  return <StyledInput name={name} ref={inputRef} type="text" {...rest} />
}

export default Input
