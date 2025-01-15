import axios from "axios";

const SignUpUser = (data) => axios.post("/api/signup", data);
const LoginUser = (data) => axios.post("/api/login", data);


export default {

  SignUpUser,
  LoginUser,
};
