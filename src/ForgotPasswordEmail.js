/**
 * @author Anthony Altieri on 11/13/16.
 */

const host = process.env.NODE_ENV === 'production'
  ? 'https://scholar.xyz'
  : 'http://localhost:3000';
export default (code) => {
  return (`
    <div>
        <p>Click the button to be re-directed to where you can reset your password</p>
      <a 
      href="${host}/forgotPassword/${code}" 
      style="
                          border: 10px;
                          box-sizing: border-box;
                          display: inline-block;
                          font-family: Lato, sans-serif;
                          -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
                          cursor: pointer;
                          text-decoration: none;
                          margin: 0px;
                          padding: 0px;
                          outline: none;
                          font-size: inherit;
                          font-weight: inherit;
                          transform: translate(0px, 0px);
                          position: relative;
                          height: 36px;
                          line-height: 36px;
                          width: 100%;
                          border-radius: 2px;
                          transition: all 450ms cubic-bezier(0.23, 1, 0.32, 1) 0ms;
                          background-color: #FF7C6B;
                          text-align: center;
                          text-decoration: none;
                          color: #FFFFFF;
                        "
      >
      RESET PASSWORD
      
</a>
    
</div>
  `)

};

