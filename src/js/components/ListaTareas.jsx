import { useState, useEffect } from "react";

const ListaTareas = () => {

  // en que estado esta el COMPONENTE
  const [tareas, setTareas] = useState([]);      // aqui creo array de tareas
  const [nuevaTarea, setNuevaTarea] = useState(""); // texto del input
  const [cargando, setCargando] = useState(false); // indicador de carga (true/false)
  const [error, setError] = useState("");          // mensaje de error

  // configuración
  const usuario = "noheliabam";
  const api = "https://playground.4geeks.com/todo";


  // cargar usuario al inicio

  useEffect(() => {  //corre solo una vez al cargar
    (async () => { //funcion asincrona para poder usar await
      setCargando(true);   // activa carga
      setError("");        // limpia los errores anteriores


      try {
        let resp = await fetch(`${api}/users/${usuario}`); // fetch le hace la peticion a GET (user/noheliabam) y await espera sin bloquear

        //si no existe el usuario lo crea
        if (resp.status === 404) { //si es 404 NO EXISTE
          const crear = await fetch(`${api}/users/${usuario}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
          });
          if (!crear.ok) throw new Error("No se pudo crear el usuario");
          resp = await fetch(`${api}/users/${usuario}`);
        } else if (!resp.ok) {
          throw new Error("Error al cargar usuario");
        }
        const data = await resp.json();
        setTareas(data.todos || []);
      } catch (error) {        //si algo falla guarda el msg de error
        setError(error.message);
      } finally {
        setCargando(false); // desactiva carga pase lo que pase
      }
    })();
  }, []);

  // Recargar tareas GET
  const recargarTareas = async () => {
    try {
      const recargar = await fetch(`${api}/users/${usuario}`); //hace GET al usuario
      const data = await recargar.json();                       //convierte la respuesta a JSON
      setTareas(data.todos || []);                       //actualiza el estado con setTareas
    } catch (error) {
      setError(error.message);
    }
  };

  //Agregar Tarers POST
  const agregarTarea = async () => {
    const texto = nuevaTarea.trim(); //.trim elimina espacios vacios
    if (!texto) return;              //si esta vacio no hace nada

    try {
      const resp = await fetch(`${api}/todos/${usuario}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: texto, is_done: false }), //convierte a JSON
      });
      if (!resp.ok) throw new Error("Error al agregar"); //si falla es error
      //y si funciona
      setNuevaTarea("");       // limpia el input
      await recargarTareas();  // y actualiza la lista
    } catch (error) {
      setError(error.message);
    }
  };

  // Eliminar DELETE
  // hace DELETE todos:{id} si es OK recarga las tareas
  const eliminarTarea = async (id) => {
    try {
      const resp = await fetch(`${api}/todos/${id}`, { method: "DELETE" });
      if (!resp.ok) throw new Error("Error al eliminar");
      await recargarTareas();
    } catch (error) {
      setError(error.message);
    }
  };

  // Limpiar todas las tareas (DELETE + POST)

  const limpiarTareas = async () => {
    try {
      const del = await fetch(`${api}/users/${usuario}`, { method: "DELETE" }); //borra el usuario y todas sus tareas
      if (!del.ok) throw new Error("Error borrando usuario");


      const crear = await fetch(`${api}/users/${usuario}`, { // recrea el usuario vacio con POST
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      if (!crear.ok) throw new Error("Error recreando usuario");// si la respuesta de la API no es correcta muestra un error
      setTareas([]);
    } catch (error) {// captura el error
      setError(error.message);//guarda el texto del error
    }
  };

  // mi aplicacion
  return (
    <div className="container mt-4">
      <h1 className="mb-3">Lista de Tareas</h1>
      <p>Usuario: <strong>{usuario}</strong></p>

      {/*input*/}
      <div className="mb-3 d-flex gap-2">
        <input
          type="text"
          className="form-control"
          value={nuevaTarea}
          onChange={(error) => setNuevaTarea(error.target.value)}
          onKeyDown={(error) => error.key === "Enter" && agregarTarea()}
          placeholder="Escribe una tarea aqui..."
        />

        <button className="btn btn-success" onClick={agregarTarea}>Agregar</button>
        <button className="btn btn-secondary" onClick={recargarTareas}>Recargar</button>
        <button
          className="btn btn-danger"
          onClick={limpiarTareas}
          disabled={tareas.length === 0}
        >
          Limpiar Todo
        </button>
      </div>

      {cargando && <p>Cargando...</p>}
      {error && <p className="text-danger">❌ {error}</p>}

      {tareas.length === 0 ? (
        <p>No hay tareas pendientes.</p>
      ) : (
        <ul className="list-group">
          {tareas.map((t) => ( //recorre el array con .map y muestra cada tarea
            <li key={t.id} className="list-group-item d-flex justify-content-between align-items-center">
              {t.label}
              <button className="btn btn-sm btn-outline-danger" onClick={() => eliminarTarea(t.id)}>
                Eliminar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ListaTareas;


