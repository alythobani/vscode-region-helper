(*#region FirstRegion*)
let x = 42
(*#endregion*)

(*  #region Second Region *)
let my_function () =
  (*  #region    InnerRegion   *)
  Printf.printf "Hello, World!\n"
  (*  #endregion   ends InnerRegion *)

  (* #region *)
  let y = 24 in ()
  (* #endregion *)
(*   #endregion *)
