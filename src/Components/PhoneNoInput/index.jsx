import React, {useState, useEffect} from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './style.css'


const PhoneNoInput = ({ phone, onChangePhone, onCountryChange }) => {

  // const [selectedCountryCode, setSelectedCountryCode] = useState()
  // const [selectedCountry, setSelectedCountry] = useState()

  // useEffect(() => {
  //   setSelectedCountryCode('92')
  //   setSelectedCountry('PK')
  // }, [])
  

  return (
    <>
          <PhoneInput
              placeholder="Enter phone number"
              country={'pk'}
              value={phone}
              onChange={phone => {
                  onChangePhone(phone)
              }}
          />

          {/* <PhoneInput
              placeholder="Enter phone number"
              country={'pk'}
              value={phone}
              autoFormat={false}
              onKeyDown={(e)=> {
                
                const newNum = e.target.value.replace(`+${selectedCountryCode}`, "");
                
                if((newNum.length === dummyPhoneNumber[selectedCountry].length)){
                  if(e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'r' || e.key === 'R'|| e.key === 'A'|| e.key === 'a'){

                  }
                  else if(e.key === 'Backspace' || e.key === 'Delete'){
                  onChangePhone(e.target.value)
                  }else{
                    e.preventDefault()
                  }
                }else{
                  onChangePhone(e.target.value)
                }
              }}
              onChange={(phone, country, e, formattedValue) => {
                  onChangePhone(phone)
                  if(phone !== '' || phone !== null || phone !== undefined){

                  }
                  if (selectedCountry !== country.countryCode.toUpperCase()) {
                    onCountryChange(country.dialCode);
                  }
                  setSelectedCountryCode(country.dialCode)
                  setSelectedCountry(country.countryCode.toUpperCase())
              }}
          /> */}
    </>
  )
}

export default PhoneNoInput;