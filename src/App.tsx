import React from 'react';
import styled from "styled-components";
import {TikiTakiToki} from "./TikiTakiToki";
import "papercss/dist/paper.min.css";

export default function App() {
  return (
    <Main>
      <TikiTakiToki/>
    </Main>
  );
}
 
const Main = styled.main`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;