import { useState } from "react";
import { read, utils, writeFile } from 'xlsx';

const Home = () => {
  const [movies, setMovies] = useState([]);
  const [message, setMessage] = useState("");

  // Importa el archivo de excel
  const handleImport = ($event) => {
    const files = $event.target.files;
    if (files.length) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const wb = read(event.target.result);
        const sheets = wb.SheetNames;

        if (sheets.length) {
          const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
          setMovies(rows)
        }
      }
      reader.readAsArrayBuffer(file);
    }
  }

  let handleClick = async () => {
    try {
      let res = await fetch("http://localhost:3001/api", {
        method: "POST",
        body: JSON.stringify({
          movies: movies,
        }),
      });
      // let resJson = await res.json();
      if (res.status === 200) {
        setMovies("");
        setMessage("Pelicula registrada");
      } else {
        setMessage("Ha ocurrido un error");
      }
    } catch (err) {
      console.log(err);
    }
  };

  // Exporta el archivo de excel
  const handleExport = () => {
    const headings = [[
      'Movie',
      'Category',
      'Director',
      'Rating'
    ]];
    const wb = utils.book_new();
    const ws = utils.json_to_sheet([]);
    utils.sheet_add_aoa(ws, headings);
    utils.sheet_add_json(ws, movies, { origin: 'A2', skipHeader: true });
    utils.book_append_sheet(wb, ws, 'Report');
    writeFile(wb, 'Movie Report.xlsx');
  }
  return (
    <>
      <div className="row mb-2 mt-5">
        <div className="col-sm-6 offset-3">
          <div className="row">
            <div className="col-md-6">
              <div className="input-group">
                <div className="custom-file">
                  {/* el atributo accept dentro de un input file, permite acceptar diferentes tipos de archivos según se requieran */}
                  <input type="file" name="file" className="custom-file-input" id="inputGroupFile" required onChange={handleImport}
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" />
                  <label className="custom-file-label" htmlFor="inputGroupFile">Choose file</label>
                  <button onClick={handleClick}>Enviar</button>
                </div>
              </div>
            </div>
            <div className="col-md-6">
              <button onClick={handleExport} className="btn btn-primary float-right">
                Export <i className="fa fa-download"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="message">{message ? <p>{message}</p> : null}</div>
      <div className="row">
        <div className="col-sm-6 offset-3">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Id</th>
                <th scope="col">Movie</th>
                <th scope="col">Category</th>
                <th scope="col">Director</th>
                <th scope="col">Rating</th>
              </tr>
            </thead>
            <tbody>
              {
                movies.length
                  ?
                  movies.map((movie, index) => (
                    <tr key={index}>
                      <th scope="row">{index + 1}</th>
                      <td>{movie.Movie}</td>
                      <td>{movie.Category}</td>
                      <td>{movie.Director}</td>
                      <td><span className="badge bg-warning text-dark">{movie.Rating}</span></td>
                    </tr>
                  ))
                  :
                  <tr>
                    <td colSpan="5" className="text-center">No Movies Found.</td>
                  </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </>

  );
};

export default Home;