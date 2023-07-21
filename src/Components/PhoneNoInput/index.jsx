import React, {useState, useEffect} from 'react'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import './style.css'


const PhoneNoInput = ({ phone, onChangePhone, onCountryChange, phoneError }) => {

  // const [selectedCountryCode, setSelectedCountryCode] = useState()
  // const [selectedCountry, setSelectedCountry] = useState()

  // useEffect(() => {
  //   setSelectedCountryCode('92')
  //   setSelectedCountry('PK')
  // }, [])

  useEffect(() => {
    console.log(phoneError);
  }, [])
  
  

  return (
    <>
          <PhoneInput
          containerClass={phoneError ? "customPhoneSTyle========" : ''}
          // inputStyle={{border: '1px solid red'}}
          // containerStyle={{border: '1px solid #FF4D4F', borderTopLeftRadius: '4px', borderBottomLeftRadius: '4px', borderTopRightRadius: '6px', borderBottomRightRadius: '6px', }}
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