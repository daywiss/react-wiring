export default (test,message) =>{
  if(test == null) throw new Error(message)
  return test
}
